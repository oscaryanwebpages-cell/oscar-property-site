import { initializeApp } from 'firebase-admin/app';
import { getFirestore, collection, addDoc, serverTimestamp, connectFirestoreEmulator } from 'firebase-admin/firestore';

const app = initializeApp({ projectId: 'oscar-property-1cc52' });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

const testListings = [
  {
    title: "Industrial Factory, Nibong Tebal, Penang",
    price: 60000000, location: "Penang", category: "Industrial", type: "SALE",
    landSize: "10.38 Acres", tenure: "Freehold",
    imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c",
    featured: true, images: ["https://images.unsplash.com/photo-1553413077-190dd305871c"],
    status: "active", description: "Large industrial factory with 10.38 acres.",
    coordinates: { lat: 5.17, lng: 100.48 }
  },
  {
    title: "Modern Office Space, Georgetown", price: 2500000, location: "Penang",
    category: "Office", type: "SALE", landSize: "2,500 sqft", tenure: "Leasehold",
    imageUrl: "https://images.unsplash.com/photo-14973667526719-2422d789623f",
    featured: true, images: ["https://images.unsplash.com/photo-14973667526719-2422d789623f"],
    status: "active", description: "Prime office space in Georgetown.",
    coordinates: { lat: 5.41, lng: 100.33 }
  }
];

async function seedDatabase() {
  console.log('Seeding database...');
  const listingsRef = collection(db, 'listings');
  for (const listing of testListings) {
    try {
      await addDoc(listingsRef, {
        ...listing, videoUrl: null, audioUrl: null, panorama360: [],
        propertyGuruUrl: null, iPropertyUrl: null,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      console.log(`+ ${listing.title}`);
    } catch (e) { console.error(`- ${listing.title}: ${e.message}`); }
  }
  console.log('Done!');
  process.exit(0);
}
seedDatabase();
