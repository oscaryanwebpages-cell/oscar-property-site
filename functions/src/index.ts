// Load .env.local for local development (emulator)
// Note: .env is renamed to .env.local to avoid Firebase CLI auto-loading it during deployment
import * as path from "path";
import * as dotenv from "dotenv";

// Use absolute path for .env.local to ensure it works in emulator
const envPath = path.resolve(__dirname, ".env.local");
dotenv.config({ path: envPath });

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { GoogleGenerativeAI } from "@google/generative-ai";

initializeApp();

// Detect if running in emulator environment
const isEmulator =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  process.env.FIREBASE_CONFIG?.includes("emulator") ||
  process.env.FIREBASE_CONFIG?.includes("localhost");

const geminiApiKeySecret = defineSecret("GEMINI_API_KEY");

const ADMIN_EMAILS = ["oscar@oscaryan.my", "oscaryanwebpages@gmail.com"];

const EXTRACTION_SCHEMA = `{
  "title": "string - property title",
  "address": "string - full address",
  "propertyType": "string - Commercial | Industrial | Land | Office",
  "tenure": "string - Freehold | Leasehold",
  "price": "number - asking price in RM (e.g. 60000000)",
  "landSize": "string - e.g. 10.38 Acres, 452,172 sf",
  "buildUpArea": "string - built-up area details",
  "lotNumbers": "string - lot/title numbers",
  "ceilingHeights": "string - ridge and eave heights",
  "powerSupply": "string - e.g. 800 amp",
  "floorLoad": "string - e.g. 2 ton per m2",
  "currentStatus": "string - e.g. Own Use",
  "viewingPIC": "string - viewing contact name and phone",
  "otherRemarks": "string - other remarks/conditions",
  "googleMapLink": "string - Google Maps URL"
}`;

const PROMPT = `You are extracting property listing information from a Malaysian real estate fact sheet or property specification.
Extract all available fields and return a JSON object. Use null for missing values.
Property types must be one of: Commercial, Industrial, Land, Office.
Tenure must be one of: Freehold, Leasehold.
Price must be a number (no commas, no RM prefix).
Return ONLY valid JSON, no markdown or extra text.

Schema: ${EXTRACTION_SCHEMA}`;

// Conditionally use secrets based on environment
const functionConfig = isEmulator
  ? { region: "us-central1" }
  : { region: "us-central1", secrets: [geminiApiKeySecret] };

export const extractListing = onCall(functionConfig, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in");
  }
  const email = request.auth.token.email as string | undefined;
  if (!email || !ADMIN_EMAILS.includes(email)) {
    throw new HttpsError("permission-denied", "Admin access required");
  }

  const { imageBase64, mimeType, text } = request.data as {
    imageBase64?: string;
    mimeType?: string;
    text?: string;
  };

  if (!imageBase64 && !text) {
    throw new HttpsError(
      "invalid-argument",
      "Provide imageBase64+mimeType or text",
    );
  }

  // In emulator, use environment variable directly; in production, use Secret
  const apiKey = isEmulator
    ? process.env.GEMINI_API_KEY
    : geminiApiKeySecret.value() || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured", {
      isEmulator,
      hasEnvVar: !!process.env.GEMINI_API_KEY,
      envPath,
    });
    throw new HttpsError(
      "failed-precondition",
      isEmulator
        ? "GEMINI_API_KEY not configured. Check functions/.env.local file."
        : "GEMINI_API_KEY not configured. Run: firebase functions:secrets:set GEMINI_API_KEY",
    );
  }

  let result;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash - latest and most capable model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    if (text) {
      result = await model.generateContent(
        `Extract from this text:\n\n${text}\n\n${PROMPT}`,
      );
    } else if (imageBase64 && mimeType) {
      result = await model.generateContent([
        { text: PROMPT },
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: imageBase64,
          },
        },
      ]);
    } else {
      throw new HttpsError(
        "invalid-argument",
        "Provide imageBase64+mimeType or text",
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gemini API error:", msg);
    if (msg.includes("API key") || msg.includes("403") || msg.includes("401")) {
      throw new HttpsError(
        "failed-precondition",
        "Invalid Gemini API key. Check GEMINI_API_KEY.",
      );
    }
    throw new HttpsError("internal", `Gemini error: ${msg.slice(0, 100)}`);
  }

  const response = result!.response;
  const rawText = response.text();

  if (!rawText) {
    console.error("Gemini returned empty text");
    throw new HttpsError("internal", "No response from Gemini");
  }

  let parsed: Record<string, unknown>;
  try {
    const cleaned = rawText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", rawText.slice(0, 200));
    throw new HttpsError("internal", "Failed to parse Gemini response as JSON");
  }

  return parsed;
});
