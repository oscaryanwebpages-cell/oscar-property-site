import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { app } from "./firebase";
import type { ListingExtraction } from "../types";

// Use same region as Cloud Function
const functions = getFunctions(app, "us-central1");

// Connect to Functions emulator in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR !== "false") {
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("🔧 Connected to Functions emulator at localhost:5001");
  } catch (error) {
    // Emulator already connected, ignore
    console.log("Functions emulator connection:", error);
  }
}

export async function extractListingFromImage(
  file: File,
): Promise<ListingExtraction> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Part = result.split(",")[1];
      resolve(base64Part || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const extractFn = httpsCallable<
    { imageBase64: string; mimeType: string },
    ListingExtraction
  >(functions, "extractListing");
  const res = await extractFn({ imageBase64: base64, mimeType: file.type });
  return res.data;
}

export async function extractListingFromText(
  text: string,
): Promise<ListingExtraction> {
  const extractFn = httpsCallable<{ text: string }, ListingExtraction>(
    functions,
    "extractListing",
  );
  const res = await extractFn({ text });
  return res.data;
}
