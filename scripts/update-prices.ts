import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

dotenv.config();

import { extractTextFromImageWithMalay } from './ocr-parser';
import { parseSpecText } from './spec-parser';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountContent = readFileSync(serviceAccountPath!, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountContent);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const SOURCE_DIR = join(homedir(), 'Downloads', 'oscarlisting');

async function updateMissingPrices() {
  console.log('Fetching listings without prices...\n');
  const snapshot = await db.collection('listings').get();

  const withoutPrice = snapshot.docs.filter(doc => {
    const data = doc.data();
    return !data.price || data.price === 0;
  });

  console.log(`Found ${withoutPrice.length} listings without price\n`);

  for (const doc of withoutPrice) {
    const data = doc.data();
    const title = data.title;

    console.log(`\nProcessing: ${title}`);
    console.log(`Images: ${data.images?.length || 0}`);

    // Try to find the property directory
    const categories = ['Factory', 'Land', 'Shop Lot'];
    let foundDir = false;
    let specData = null;

    for (const category of categories) {
      const categoryPath = join(SOURCE_DIR, category);
      try {
        const properties = await readdir(categoryPath);
        for (const prop of properties) {
          // Try to match by title or approximate match
          if (prop.includes(title.trim()) || title.trim().includes(prop.replace(/\s+$/, ''))) {
            const propertyPath = join(categoryPath, prop);
            console.log(`  Found directory: ${category}/${prop}`);

            // Look for spec image
            const files = await readdir(propertyPath);
            const specImage = files.find(f =>
              f.toLowerCase().endsWith('.png') &&
              (/spec|fact|sheet|detail|17|4179/i.test(f) || files.filter(f => f.toLowerCase().endsWith('.png')).length === 1)
            );

            if (specImage) {
              console.log(`  🔍 Found spec image: ${specImage}`);
              try {
                const ocrText = await extractTextFromImageWithMalay(join(propertyPath, specImage));
                console.log(`  📝 OCR text extracted (first 200 chars): ${ocrText.substring(0, 200)}...`);
                specData = parseSpecText(ocrText);
                console.log(`  ✅ Parsed price: ${specData.price ? 'RM ' + specData.price.toLocaleString() : 'N/A'}`);
              } catch (error) {
                console.log(`  ❌ OCR failed: ${error}`);
              }
            } else {
              // Look for text files
              const textFile = files.find(f => f === 'text.txt' || f === 'details.txt');
              if (textFile) {
                console.log(`  📄 Found text file: ${textFile}`);
                try {
                  const textContent = await readFile(join(propertyPath, textFile), 'utf-8');
                  specData = parseSpecText(textContent);
                  console.log(`  ✅ Parsed price: ${specData.price ? 'RM ' + specData.price.toLocaleString() : 'N/A'}`);
                } catch (error) {
                  console.log(`  ❌ Text file read failed: ${error}`);
                }
              }
            }

            foundDir = true;
            break;
          }
        }
        if (foundDir) break;
      } catch {
        // Directory doesn't exist or can't read
      }
    }

    // Update if we found price
    if (specData && specData.price) {
      console.log(`  💾 Updating price in Firestore...`);
      await doc.ref.update({
        price: specData.price,
        type: specData.type || data.type,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ Updated!`);
    } else {
      console.log(`  ⚠️  No price info found`);
    }
  }

  console.log('\n\n✅ Price update process complete!');
}

updateMissingPrices().then(() => process.exit(0));
