import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from scripts directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountContent = readFileSync(serviceAccountPath!, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountContent);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'oscar-property-1cc52.firebasestorage.app'
});

const db = admin.firestore();

async function checkListingsWithPrice() {
  const snapshot = await db.collection('listings').get();

  console.log(`\n📊 Total listings: ${snapshot.size}\n`);

  // Listings WITH price
  const withPrice = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.price && data.price > 0;
  });

  console.log(`✅ Listings WITH price (${withPrice.length}):\n`);
  withPrice.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.title}`);
    console.log(`    Price: RM ${data.price.toLocaleString()}`);
    console.log(`    Type: ${data.type}`);
    console.log(`    Category: ${data.category}`);
    console.log(`    Images: ${data.images?.length || 0}`);
    console.log(`    ID: ${doc.id}\n`);
  });

  // Listings WITHOUT price
  const withoutPrice = snapshot.docs.filter(doc => {
    const data = doc.data();
    return !data.price || data.price === 0;
  });

  console.log(`\n❌ Listings WITHOUT price (${withoutPrice.length}):\n`);
  withoutPrice.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.title} (${data.images?.length || 0} images)`);
  });
}

checkListingsWithPrice().then(() => process.exit(0));
