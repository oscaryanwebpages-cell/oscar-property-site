import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

import { extractTextFromImageWithMalay } from './ocr-parser';
import { parseSpecText, generateDescription, ParsedSpec } from './spec-parser';
import { uploadDirectoryImages, getSpecImagePath, setStorageBucket } from './image-uploader';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountContent = readFileSync(serviceAccountPath!, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountContent);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'oscar-property-1cc52.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Set bucket for image uploader
setStorageBucket(bucket);

// Source directory
const SOURCE_DIR = join(homedir(), 'Downloads', 'oscarlisting');

function mapCategory(folderName: string): string {
  const map: Record<string, string> = {
    'Factory': 'Industrial',
    'Land': 'Land',
    'Shop Lot': 'Commercial',
  };
  return map[folderName] || 'Other';
}

function generateListingId(category: string, propertyName: string): string {
  const cleanName = propertyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  const timestamp = Date.now().toString(36);
  return `${category.toLowerCase()}-${cleanName}-${timestamp}`;
}

async function testOneProperty() {
  // Test with just one property first
  const categoryName = 'Factory';
  const propertyName = 'Kulai factory rent ';
  const propertyPath = join(SOURCE_DIR, categoryName, propertyName);

  console.log(`Testing import for: ${categoryName} / ${propertyName}`);
  console.log(`Path: ${propertyPath}`);

  try {
    // Step 1: Find and read spec data
    const specImagePath = await getSpecImagePath(propertyPath);
    let specData: ParsedSpec = {};

    if (specImagePath) {
      console.log(`📄 Found spec image: ${basename(specImagePath)}`);
      console.log(`🔍 Extracting text via OCR...`);
      const ocrText = await extractTextFromImageWithMalay(specImagePath);
      console.log(`📝 OCR Text:\n${ocrText.substring(0, 200)}...`);
      specData = parseSpecText(ocrText);
    } else {
      // Try to find text.txt or details.txt
      console.log(`⚠️  No spec image found, looking for text file...`);
      const textFilePath = join(propertyPath, 'text.txt');
      const detailsFilePath = join(propertyPath, 'details.txt');

      try {
        let textContent = '';
        try {
          textContent = await readFile(textFilePath, 'utf-8');
          console.log(`📄 Found text.txt`);
        } catch {
          textContent = await readFile(detailsFilePath, 'utf-8');
          console.log(`📄 Found details.txt`);
        }
        specData = parseSpecText(textContent);
      } catch {
        console.log(`⚠️  No spec file found, using directory name as title`);
        specData = { title: propertyName };
      }
    }

    console.log(`✅ Parsed spec:`, {
      title: specData.title,
      type: specData.type,
      price: specData.price,
      landSize: specData.landSize,
    });

    // Step 2: Generate listing ID
    const listingId = generateListingId(categoryName, propertyName);
    console.log(`🆔 Listing ID: ${listingId}`);

    // Step 3: Upload building photos (dry run - just count)
    console.log(`📸 Checking images...`);
    const files = await readdir(propertyPath);
    const imageFiles = files.filter(f =>
      /\.(heic|heif|jpg|jpeg|png|gif|webp)$/i.test(f)
    );
    console.log(`   Found ${imageFiles.length} image files`);
    console.log(`   Files: ${imageFiles.join(', ')}`);

    console.log(`\n✅ Test passed! Ready for full import.`);
  } catch (error) {
    console.error(`❌ Error:`, error);
  }
}

testOneProperty().then(() => process.exit(0));
