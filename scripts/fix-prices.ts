import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountContent = readFileSync(serviceAccountPath!, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountContent);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixIncorrectPrices() {
  console.log('Fixing incorrect prices (psf prices)...\n');

  // Fix Seelong medium for sale - RM 68 psf, need to calculate from land size
  const snapshot1 = await db.collection('listings').where('price', '==', 68).get();
  if (!snapshot1.empty) {
    const doc = snapshot1.docs[0];
    const data = doc.data();
    // 6 acres at RM 68 psf = 6 * 43560 * 68 = RM 17,772,480
    const correctPrice = 17772480;
    console.log(`Fixing ${data.title}: RM 68 → RM ${correctPrice.toLocaleString()}`);
    await doc.ref.update({ price: correctPrice });
  }

  // Fix Senai idman land sell land - RM 90 psf
  const snapshot2 = await db.collection('listings').where('price', '==', 90).get();
  if (!snapshot2.empty) {
    const doc = snapshot2.docs[0];
    const data = doc.data();
    // 2-20 acres at RM 90 psf. Using avg 11 acres: 11 * 43560 * 90 = RM 43,114,400
    const correctPrice = 43114400;
    console.log(`Fixing ${data.title}: RM 90 → RM ${correctPrice.toLocaleString()}`);
    await doc.ref.update({ price: correctPrice });
  }

  // Fix Tampoi gembilang - RM 1.8 (likely RM 1.8 million from text)
  const snapshot3 = await db.collection('listings').where('title', '==', 'Tampoi gembilang').get();
  if (!snapshot3.empty) {
    const doc = snapshot3.docs[0];
    const data = doc.data();
    const correctPrice = 1800000;
    console.log(`Fixing ${data.title}: RM 1.8 → RM ${correctPrice.toLocaleString()}`);
    await doc.ref.update({ price: correctPrice });
  }

  console.log('\n✅ Fixed incorrect prices!');
}

fixIncorrectPrices().then(() => process.exit(0));
