#!/usr/bin/env tsx

/**
 * Import listings from ~/Downloads/oscarlisting/ to Firebase
 *
 * Usage:
 *   pnpm tsx scripts/import-oscar-listings.ts
 */

import { readdir, readFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

import { extractTextFromImageWithMalay, detectSpecImage } from './ocr-parser';
import { parseSpecText, generateDescription, ParsedSpec } from './spec-parser';
import { uploadDirectoryImages, getSpecImagePath, UploadResult, setStorageBucket } from './image-uploader';

// Initialize Firebase Admin
// Try to get service account from env var or file path
let serviceAccount: admin.ServiceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // From environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // From file path (easier for local development)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountContent = readFileSync(serviceAccountPath, 'utf-8');
  serviceAccount = JSON.parse(serviceAccountContent);
} else {
  throw new Error(
    'Firebase service account not configured.\n' +
    'Set FIREBASE_SERVICE_ACCOUNT_PATH in .env:\n' +
    '  FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json'
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'oscar-property-1cc52.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Set bucket for image uploader
setStorageBucket(bucket);

// Source directory
const SOURCE_DIR = join(homedir(), 'Downloads', 'oscarlisting');

/**
 * Category mapping from folder names to property categories
 */
function mapCategory(folderName: string): string {
  const map: Record<string, string> = {
    'Factory': 'Industrial',
    'Land': 'Land',
    'Shop Lot': 'Commercial',
  };
  return map[folderName] || 'Other';
}

/**
 * Generate a unique listing ID
 */
function generateListingId(category: string, propertyName: string): string {
  const cleanName = propertyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  const timestamp = Date.now().toString(36);
  return `${category.toLowerCase()}-${cleanName}-${timestamp}`;
}

/**
 * Process a single property directory
 */
async function processPropertyDirectory(
  propertyPath: string,
  categoryName: string,
  propertyName: string
): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${categoryName} / ${propertyName}`);
  console.log(`${'='.repeat(60)}`);

  try {
    // Step 1: Find and read spec data
    const specImagePath = await getSpecImagePath(propertyPath);
    let specData: ParsedSpec = {};

    if (specImagePath) {
      console.log(`📄 Found spec image: ${basename(specImagePath)}`);
      console.log(`🔍 Extracting text via OCR...`);
      const ocrText = await extractTextFromImageWithMalay(specImagePath);
      specData = parseSpecText(ocrText);
      console.log(`✅ OCR completed. Detected:`, {
        title: specData.title,
        type: specData.type,
        price: specData.price,
      });
    } else {
      // Try to find text.txt or details.txt
      console.log(`⚠️  No spec image found, looking for text file...`);
      const textFilePath = join(propertyPath, 'text.txt');
      const detailsFilePath = join(propertyPath, 'details.txt');
      let textContent = '';
      let foundTextFile = false;

      try {
        textContent = await readFile(textFilePath, 'utf-8');
        foundTextFile = true;
        console.log(`📄 Found text.txt`);
      } catch {
        try {
          textContent = await readFile(detailsFilePath, 'utf-8');
          foundTextFile = true;
          console.log(`📄 Found details.txt`);
        } catch {
          // No text file found
        }
      }

      if (foundTextFile) {
        specData = parseSpecText(textContent);
      } else {
        console.log(`⚠️  No spec file found, using directory name as title`);
        specData = { title: propertyName };
      }
    }

    // Step 2: Generate listing ID
    const listingId = generateListingId(categoryName, propertyName);

    // Step 3: Upload building photos
    console.log(`📸 Uploading images...`);
    const uploadedImages = await uploadDirectoryImages(propertyPath, listingId, true);

    if (uploadedImages.length === 0) {
      console.log(`⚠️  No images uploaded, skipping listing`);
      return;
    }

    console.log(`✅ Uploaded ${uploadedImages.length} images`);

    // Step 4: Build listing document
    const listingDoc = {
      title: specData.title || propertyName,
      price: specData.price || 0,
      location: specData.location || propertyName,
      category: mapCategory(categoryName),
      type: specData.type || 'SALE',
      landSize: specData.landSize || '',
      tenure: specData.tenure || 'Freehold',
      imageUrl: uploadedImages[0].url,
      featured: false,
      status: 'active',
      images: uploadedImages.map(u => u.url),
      description: generateDescription(specData),
      specifications: {
        landUse: specData.landUse || '',
        buildUpArea: specData.builtUpArea || '',
        ceilingHeights: specData.ceilingHeight || '',
        powerSupply: specData.powerSupply || '',
        floorLoad: specData.floorLoading || '',
        eaveHeight: specData.eaveHeight || '',
        viewingPIC: 'Oscar Yan',
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Step 5: Create Firestore document
    console.log(`💾 Creating Firestore document...`);
    const docRef = await db.collection('listings').add(listingDoc);
    console.log(`✅ Created listing: ${docRef.id}`);
    console.log(`   Title: ${listingDoc.title}`);
    console.log(`   Price: RM ${listingDoc.price.toLocaleString()}`);
    console.log(`   Type: ${listingDoc.type}`);
    console.log(`   Images: ${uploadedImages.length}`);

  } catch (error) {
    console.error(`❌ Error processing ${propertyName}:`, error);
  }
}

/**
 * Process all properties in a category directory
 */
async function processCategory(categoryName: string): Promise<void> {
  const categoryPath = join(SOURCE_DIR, categoryName);
  const entries = await readdir(categoryPath, { withFileTypes: true });

  const propertyDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

  console.log(`\n📁 Category: ${categoryName} (${propertyDirs.length} properties)`);

  for (const propertyDir of propertyDirs) {
    const propertyPath = join(categoryPath, propertyDir.name);
    await processPropertyDirectory(propertyPath, categoryName, propertyDir.name);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Oscar Property Listings Importer                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n📂 Source: ${SOURCE_DIR}`);

  try {
    // Read all category directories
    const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
    const categories = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name);

    console.log(`📁 Found ${categories.length} categories: ${categories.join(', ')}`);

    // Process each category
    for (const category of categories) {
      await processCategory(category);
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   Import Complete!                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
