import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FirestoreTestimonial, COLLECTIONS } from '../types/firestore';

// Testimonial type for UI
export interface Testimonial {
  id: string;
  clientName: string;
  transactionType: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
}

// Convert Firestore document to Testimonial type
const convertToTestimonial = (doc: { id: string; data: () => FirestoreTestimonial }): Testimonial => {
  const data = doc.data();
  return {
    id: doc.id,
    clientName: data.isAnonymous ? 'Anonymous' : data.clientName,
    transactionType: data.transactionType,
    rating: data.rating,
    comment: data.comment,
    isAnonymous: data.isAnonymous,
  };
};

// Get all testimonials
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const testimonialsRef = collection(db, COLLECTIONS.TESTIMONIALS);
  const q = query(testimonialsRef, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToTestimonial);
};

// Get featured testimonials (top rated, limit 5)
export const getFeaturedTestimonials = async (): Promise<Testimonial[]> => {
  const testimonialsRef = collection(db, COLLECTIONS.TESTIMONIALS);
  const q = query(
    testimonialsRef,
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, 5).map(convertToTestimonial);
};

// Get single testimonial by ID
export const getTestimonialById = async (id: string): Promise<Testimonial | null> => {
  const docRef = doc(db, COLLECTIONS.TESTIMONIALS, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return convertToTestimonial({ id: snapshot.id, data: () => snapshot.data() as FirestoreTestimonial });
};

// Subscribe to testimonials (real-time updates)
export const subscribeToTestimonials = (
  callback: (testimonials: Testimonial[]) => void
): Unsubscribe => {
  const testimonialsRef = collection(db, COLLECTIONS.TESTIMONIALS);
  const q = query(testimonialsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const testimonials = snapshot.docs.map(convertToTestimonial);
    callback(testimonials);
  });
};

// Admin: Create testimonial
export const createTestimonial = async (
  data: Omit<FirestoreTestimonial, 'id' | 'createdAt'>
): Promise<string> => {
  const testimonialsRef = collection(db, COLLECTIONS.TESTIMONIALS);

  const docRef = await addDoc(testimonialsRef, {
    ...data,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
};

// Admin: Update testimonial
export const updateTestimonial = async (
  id: string,
  data: Partial<Omit<FirestoreTestimonial, 'id' | 'createdAt'>>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.TESTIMONIALS, id);
  await updateDoc(docRef, data);
};

// Admin: Delete testimonial
export const deleteTestimonial = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.TESTIMONIALS, id);
  await deleteDoc(docRef);
};
