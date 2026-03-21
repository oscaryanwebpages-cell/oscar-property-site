import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountContent = readFileSync(serviceAccountPath!, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountContent);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'oscar-property-1cc52.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function clearTestListings() {
  console.log('Fetching all listings...');
  const snapshot = await db.collection('listings').get();

  console.log(`Found ${snapshot.size} listings to delete...`);

  // Delete all Firestore documents
  const batch = db.batch();
  snapshot.docs.forEach((doc, index) => {
    if (index < 400) { // Firestore batch limit is 500 operations
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
  console.log('✅ Deleted Firestore documents');

  // Handle remaining if more than 400
  if (snapshot.size > 400) {
    const remaining = snapshot.docs.slice(400);
    const batch2 = db.batch();
    remaining.forEach(doc => {
      batch2.delete(doc.ref);
    });
    await batch2.commit();
    console.log('✅ Deleted remaining Firestore documents');
  }

  // Delete all images from storage
  console.log('Deleting images from Storage...');
  const [files] = await bucket.getFiles({ prefix: 'listings/' });
  console.log(`Found ${files.length} files to delete...`);

  let deletedCount = 0;
  for (const file of files) {
    await file.delete().catch(err => {
      console.error(`Failed to delete ${file.name}:`, err.message);
    });
    deletedCount++;
    if (deletedCount % 10 === 0) {
      console.log(`Deleted ${deletedCount}/${files.length} files...`);
    }
  }

  console.log(`✅ Deleted ${deletedCount} files from Storage`);
  console.log('\n✅ Cleanup complete! Ready for fresh import.');
}

clearTestListings().then(() => process.exit(0));
