import { doc, getDoc, updateDoc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AgentProfile } from '../types';
import { FirestoreAgentProfile, COLLECTIONS } from '../types/firestore';

// Convert Firestore document to AgentProfile type
const convertToAgentProfile = (data: FirestoreAgentProfile): AgentProfile => ({
  name: data.name,
  title: data.title,
  agency: data.agency,
  regNo: data.regNo,
  agencyLicense: data.agencyLicense,
  phone: data.phone,
  email: data.email,
  photoUrl: data.photoUrl,
  yearsExperience: data.yearsExperience,
  listingsCount: data.listingsCount,
  dealsClosed: data.dealsClosed,
});

// Get agent profile (single document)
export const getAgentProfile = async (): Promise<AgentProfile | null> => {
  // Using a fixed document ID 'main' for the single agent profile
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return convertToAgentProfile(snapshot.data() as FirestoreAgentProfile);
};

// Get full agent profile with bio (includes all fields)
export const getFullAgentProfile = async (): Promise<FirestoreAgentProfile | null> => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as FirestoreAgentProfile;
};

// Subscribe to agent profile changes (real-time)
export const subscribeToAgentProfile = (
  callback: (profile: AgentProfile | null) => void
): Unsubscribe => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');

  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const profile = convertToAgentProfile(snapshot.data() as FirestoreAgentProfile);
    callback(profile);
  });
};

// Admin: Update agent profile
export const updateAgentProfile = async (
  data: Partial<Omit<FirestoreAgentProfile, 'updatedAt'>>
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Admin: Update agent photo URL
export const updateAgentPhoto = async (photoUrl: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  await updateDoc(docRef, {
    photoUrl,
    updatedAt: Timestamp.now(),
  });
};

// Admin: Increment listings count
export const incrementListingsCount = async (): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const currentCount = (snapshot.data() as FirestoreAgentProfile).listingsCount || 0;
    await updateDoc(docRef, {
      listingsCount: currentCount + 1,
      updatedAt: Timestamp.now(),
    });
  }
};

// Admin: Decrement listings count
export const decrementListingsCount = async (): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const currentCount = (snapshot.data() as FirestoreAgentProfile).listingsCount || 0;
    await updateDoc(docRef, {
      listingsCount: Math.max(0, currentCount - 1),
      updatedAt: Timestamp.now(),
    });
  }
};

// Admin: Increment deals closed
export const incrementDealsClosed = async (): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.AGENT_PROFILE, 'main');
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const currentCount = (snapshot.data() as FirestoreAgentProfile).dealsClosed || 0;
    await updateDoc(docRef, {
      dealsClosed: currentCount + 1,
      updatedAt: Timestamp.now(),
    });
  }
};
