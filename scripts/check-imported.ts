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

async function checkListings() {
  const snapshot = await db.collection('listings').get();

  console.log(`\n📊 Total listings in Firestore: ${snapshot.size}\n`);

  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let withPrice = 0;
  let withoutPrice = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const cat = data.category || 'Unknown';
    const type = data.type || 'Unknown';

    byCategory[cat] = (byCategory[cat] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;

    if (data.price > 0) {
      withPrice++;
    } else {
      withoutPrice++;
    }
  });

  console.log('By Category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

  console.log('\nBy Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log(`\nPrice Info:`);
  console.log(`  With price: ${withPrice}`);
  console.log(`  Without price: ${withoutPrice}`);

  // Show sample listings
  console.log('\n📝 Sample Listings (first 5):');
  snapshot.docs.slice(0, 5).forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.title} (${data.category}, ${data.type})`);
    console.log(`    Price: RM ${data.price?.toLocaleString() || 'N/A'}`);
    console.log(`    Images: ${data.images?.length || 0}`);
    console.log(`    ID: ${doc.id}\n`);
  });
}

checkListings().then(() => process.exit(0));
