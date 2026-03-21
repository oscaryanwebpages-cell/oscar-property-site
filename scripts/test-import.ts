import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
import { join } from 'path';
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

async function test() {
  // Test Firebase connection
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountContent = readFileSync(serviceAccountPath!, 'utf-8');
  const serviceAccount = JSON.parse(serviceAccountContent);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'oscar-property-1cc52.firebasestorage.app'
  });

  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  console.log('✅ Firebase connection successful!');
  console.log('📦 Storage bucket:', bucket.name);

  // Test source directory access
  const sourceDir = join(process.env.HOME!, 'Downloads', 'oscarlisting');
  const categories = await readdir(sourceDir);
  console.log('📁 Categories found:', categories.join(', '));

  // Test listing collection access
  const snapshot = await db.collection('listings').limit(1).get();
  console.log('📊 Firestore accessible, current listings:', snapshot.size);

  console.log('\n✅ All checks passed! Ready to run import.');
}

test().catch(console.error);
