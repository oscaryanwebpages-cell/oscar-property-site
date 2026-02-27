import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing, ListingType, PropertyCategory, FilterState } from '../types';
import { FirestoreListing, COLLECTIONS } from '../types/firestore';

// Convert Firestore document to Listing type
const convertToListing = (doc: { id: string; data: () => FirestoreListing }): Listing => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    price: data.price,
    location: data.location,
    category: data.category,
    type: data.type,
    landSize: data.landSize,
    tenure: data.tenure,
    imageUrl: data.imageUrl,
    featured: data.featured,
    images: data.images,
    videoUrl: data.videoUrl || undefined,
    audioUrl: data.audioUrl || undefined,
    panorama360: data.panorama360,
    description: data.description,
    coordinates: data.coordinates || undefined,
    propertyGuruUrl: data.propertyGuruUrl || undefined,
    iPropertyUrl: data.iPropertyUrl || undefined,
  };
};

// Get all active listings
export const getListings = async (): Promise<Listing[]> => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const q = query(
    listingsRef,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToListing);
};

// Get featured listings
export const getFeaturedListings = async (): Promise<Listing[]> => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const q = query(
    listingsRef,
    where('status', '==', 'active'),
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(6)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToListing);
};

// Get single listing by ID
export const getListingById = async (id: string): Promise<Listing | null> => {
  const docRef = doc(db, COLLECTIONS.LISTINGS, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return convertToListing({ id: snapshot.id, data: () => snapshot.data() as FirestoreListing });
};

// Filter listings based on filter state
export const filterListings = async (filters: FilterState): Promise<Listing[]> => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  ];

  // Add type filter
  if (filters.listingType) {
    constraints.push(where('type', '==', filters.listingType));
  }

  // Add category filter
  if (filters.category !== 'All') {
    constraints.push(where('category', '==', filters.category));
  }

  // Add location filter
  if (filters.location !== 'All') {
    constraints.push(where('location', '==', filters.location));
  }

  const q = query(listingsRef, ...constraints);
  const snapshot = await getDocs(q);
  let listings = snapshot.docs.map(convertToListing);

  // Client-side search (for simplicity, can be moved to server with Algolia/Typesense)
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    listings = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query)
    );
  }

  return listings;
};

// Search listings by text
export const searchListings = async (searchQuery: string): Promise<Listing[]> => {
  const listings = await getListings();
  const query = searchQuery.toLowerCase();

  return listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query)
  );
};

// Get listings by location
export const getListingsByLocation = async (location: string): Promise<Listing[]> => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const q = query(
    listingsRef,
    where('status', '==', 'active'),
    where('location', '==', location),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToListing);
};

// Get unique locations for filter dropdown
export const getLocations = async (): Promise<string[]> => {
  const listings = await getListings();
  const locations = new Set(listings.map((l) => l.location));
  return Array.from(locations).sort();
};

// Subscribe to listings (real-time updates)
export const subscribeToListings = (
  callback: (listings: Listing[]) => void
): Unsubscribe => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const q = query(
    listingsRef,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map(convertToListing);
    callback(listings);
  });
};

// Paginated listings fetch
export const getListingsPaginated = async (
  pageSize: number = 12,
  lastDoc?: DocumentSnapshot
): Promise<{ listings: Listing[]; lastDoc: DocumentSnapshot | null }> => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(listingsRef, ...constraints);
  const snapshot = await getDocs(q);
  const listings = snapshot.docs.map(convertToListing);
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { listings, lastDoc: newLastDoc };
};

// Admin: Create listing
export const createListing = async (
  data: Omit<FirestoreListing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const now = Timestamp.now();

  const docRef = await addDoc(listingsRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

// Admin: Update listing
export const updateListing = async (
  id: string,
  data: Partial<Omit<FirestoreListing, 'id' | 'createdAt'>>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.LISTINGS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Admin: Delete listing
export const deleteListing = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.LISTINGS, id);
  await deleteDoc(docRef);
};

// Admin: Mark listing as sold/rented
export const markListingStatus = async (
  id: string,
  status: 'sold' | 'rented'
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.LISTINGS, id);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
};
