import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCeF5jYBri17s2--3bpJ5MpIix4kbnK6BU",
  authDomain: "oscar-property-1cc52.firebaseapp.com",
  projectId: "oscar-property-1cc52",
  storageBucket: "oscar-property-1cc52.firebasestorage.app",
  messagingSenderId: "418694105522",
  appId: "1:418694105522:web:6b14a8265a9da208fe7cab",
  measurementId: "G-91Y1NCPK30",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectStorageEmulator(storage, "gs://oscar-property-1cc52.appspot.com");
    console.log("Connected to Firebase emulators");
  } catch (error) {
    console.warn("Emulators not available, using production:", error);
  }
}

// Initialize Analytics (only in browser environment)
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};

export default app;
