// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  connectStorageEmulator,
} from "firebase/storage";
import {
  Listing,
  ListingType,
  PropertyCategory,
  AdvancedFilterState,
  PriceRange,
  DateRange,
  LandSizeRange,
} from "../types";

// =============================================================================
// PERFORMANCE OPTIMIZATION: Caching Layer
// =============================================================================

/**
 * Simple in-memory cache with TTL (Time-To-Live)
 * Improves performance for repeated queries within the cache window
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number; // Time to live in milliseconds

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    this.cache.set(key, { data, timestamp: now, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key); // Expired, remove from cache
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clean up expired entries (call periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache instances for different query types
const listingsCache = new SimpleCache<Listing[]>(5 * 60 * 1000); // 5 minutes
const listingCache = new SimpleCache<Listing | null>(10 * 60 * 1000); // 10 minutes
const paginatedCache = new SimpleCache<{
  listings: Listing[];
  hasMore: boolean;
  nextPageCursor: string | null;
}>(3 * 60 * 1000); // 3 minutes

// =============================================================================
// PERFORMANCE OPTIMIZATION: Request Deduplication
// =============================================================================

/**
 * Prevents duplicate concurrent requests for the same data
 * If a request is already in flight, return the existing promise
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in flight
    const existingPromise = this.pendingRequests.get(key);
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes (success or failure)
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

const requestDeduplicator = new RequestDeduplicator();

// =============================================================================
// PERFORMANCE OPTIMIZATION: Cache Key Generation
// =============================================================================

/**
 * Generate consistent cache keys from query parameters
 */
const generateCacheKey = (
  prefix: string,
  params: Record<string, any>,
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join("|");
  return `${prefix}::${sortedParams}`;
};

// Periodic cache cleanup (every 5 minutes)
if (typeof window !== "undefined") {
  setInterval(
    () => {
      listingsCache.cleanup();
      paginatedCache.cleanup();
    },
    5 * 60 * 1000,
  );
}

// Firebase configuration from implementation plan
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
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development (only if explicitly enabled)
// Auth uses production Firebase Auth by default
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === "true") {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("🔧 Connected to Firestore emulator at localhost:8080");
  } catch (error) {
    // Emulator already connected, ignore
    console.log("Firestore emulator connection:", error);
  }

  // Note: Auth emulator is NOT connected - using production Firebase Auth
  // Oscar's account is already configured in production Firebase Auth

  try {
    // Connect to Storage emulator
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("🔧 Connected to Storage emulator at localhost:9199");
  } catch (error) {
    // Emulator already connected, ignore
    console.log("Storage emulator connection:", error);
  }
}

// Note: Auth always uses production Firebase Auth
// Oscar's account (oscar@oscaryan.my / oscaryanwebpages@gmail.com) is already configured

// Collections
const LISTINGS_COLLECTION = "listings";
const AGENT_PROFILE_COLLECTION = "agentProfile";

// Helper: Convert Firestore document to Listing
const docToListing = (doc: any): Listing => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || "",
    price: data.price || 0,
    location: data.location || "",
    category: data.category as PropertyCategory,
    type: data.type as ListingType,
    landSize: data.landSize || "",
    tenure: data.tenure || "Freehold",
    imageUrl: data.imageUrl || "",
    featured: data.featured || false,
    status: data.status || "active", // Default to active if not set
    images: data.images || [],
    videoUrl: data.videoUrl,
    audioUrl: data.audioUrl,
    panorama360: data.panorama360 || [],
    description: data.description || "",
    coordinates: data.coordinates,
    propertyGuruUrl: data.propertyGuruUrl,
    iPropertyUrl: data.iPropertyUrl,
    specifications: data.specifications || undefined,
  };
};

// API: Get all listings (with caching)
export const getListings = async (options?: {
  skipCache?: boolean;
}): Promise<Listing[]> => {
  const cacheKey = "listings::all";

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cached = listingsCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  return requestDeduplicator.dedupe(cacheKey, async () => {
    try {
      const listingsRef = collection(db, LISTINGS_COLLECTION);
      const q = query(listingsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(docToListing);

      // Cache the result
      listingsCache.set(cacheKey, listings);

      return listings;
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  });
};

// API: Get listing by ID (with caching)
export const getListingById = async (
  id: string,
  options?: {
    skipCache?: boolean;
  },
): Promise<Listing | null> => {
  const cacheKey = `listing::${id}`;

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cached = listingCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  return requestDeduplicator.dedupe(cacheKey, async () => {
    try {
      const docRef = doc(db, LISTINGS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      const listing = docSnap.exists() ? docToListing(docSnap) : null;

      // Cache the result (cache even null to prevent repeated misses)
      listingCache.set(cacheKey, listing);

      return listing;
    } catch (error) {
      console.error("Error fetching listing:", error);
      return null;
    }
  });
};

// API: Get all listings (for AdminPanel - no status filter)
export const getAllListings = async (): Promise<Listing[]> => {
  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const q = query(listingsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToListing);
  } catch (error) {
    console.error("Error fetching all listings:", error);
    return [];
  }
};

/**
 * Get paginated listings using cursor-based pagination (with caching)
 * @param pageSize - Number of items per page (default: 10, max: 50)
 * @param pageCursor - Cursor string from previous page's nextPageCursor (for next page)
 * @param status - Filter by listing status (optional)
 * @param options - Skip cache if needed
 * @returns Paginated response with listings, hasMore flag, and next cursor
 *
 * Firestore Index Required:
 * - Composite index on (status, createdAt) for optimal performance
 * - Create in Firebase Console: Firestore > Indexes > Create Index
 */
export const getListingsPaginated = async (
  pageSize: number = 10,
  pageCursor?: string,
  status?: string,
  options?: { skipCache?: boolean },
): Promise<{
  listings: Listing[];
  hasMore: boolean;
  nextPageCursor: string | null;
  error?: string;
}> => {
  const cacheKey = generateCacheKey("paginatedListings", {
    pageSize,
    pageCursor,
    status,
  });

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cached = paginatedCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  return requestDeduplicator.dedupe(cacheKey, async () => {
    try {
      // Validate pageSize
      const validPageSize = Math.max(1, Math.min(50, pageSize));

      // Build base query
      const listingsRef = collection(db, LISTINGS_COLLECTION);
      let q = query(
        listingsRef,
        orderBy("createdAt", "desc"),
        limit(validPageSize),
      );

      // Add status filter if provided
      if (status) {
        q = query(
          listingsRef,
          where("status", "==", status),
          orderBy("createdAt", "desc"),
          limit(validPageSize),
        );
      }

      // Add cursor for pagination (start after last document from previous page)
      if (pageCursor) {
        try {
          const lastDoc = await getDoc(
            doc(db, LISTINGS_COLLECTION, pageCursor),
          );
          if (lastDoc.exists()) {
            if (status) {
              q = query(
                listingsRef,
                where("status", "==", status),
                orderBy("createdAt", "desc"),
                startAfter(lastDoc),
                limit(validPageSize),
              );
            } else {
              q = query(
                listingsRef,
                orderBy("createdAt", "desc"),
                startAfter(lastDoc),
                limit(validPageSize),
              );
            }
          }
        } catch (cursorError) {
          console.error("Invalid cursor provided:", cursorError);
          return {
            listings: [],
            hasMore: false,
            nextPageCursor: null,
            error: "Invalid pagination cursor",
          };
        }
      }

      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(docToListing);

      // Determine if there are more results
      const hasMore = listings.length === validPageSize;

      // Get the last document's ID as the next cursor
      const nextPageCursor =
        hasMore && querySnapshot.docs.length > 0
          ? querySnapshot.docs[querySnapshot.docs.length - 1].id
          : null;

      const result = {
        listings,
        hasMore,
        nextPageCursor,
      };

      // Cache the result (shorter TTL for paginated data)
      paginatedCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error fetching paginated listings:", error);
      return {
        listings: [],
        hasMore: false,
        nextPageCursor: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  });
};

// API: Filter listings with advanced filters (with caching and deduplication)
// Note: To avoid requiring composite indexes, we fetch all active listings
// and filter on the client side. For better performance with large datasets,
// create the following composite indexes in Firebase Console:
//
// Recommended Indexes:
// 1. (status, createdAt) - for basic queries
// 2. (status, price, createdAt) - for price range queries
// 3. (status, createdAt DESC) - for date range queries
//
// Navigate to: Firestore > Indexes > Create Index
export const filterListings = async (
  filters: AdvancedFilterState,
  options?: { skipCache?: boolean },
): Promise<Listing[]> => {
  const cacheKey = generateCacheKey("filterListings", filters);

  // Check cache first (unless skipCache is true)
  if (!options?.skipCache) {
    const cached = listingsCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  return requestDeduplicator.dedupe(cacheKey, async () => {
    try {
      // Fetch all listings ordered by createdAt (no compound index needed)
      const listingsRef = collection(db, LISTINGS_COLLECTION);
      const q = query(
        listingsRef,
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      let listings = querySnapshot.docs.map(docToListing);

      // Client-side filtering for type, category, location
      if (filters.listingType) {
        listings = listings.filter((l) => l.type === filters.listingType);
      }

      if (filters.category && filters.category !== "All") {
        listings = listings.filter((l) => l.category === filters.category);
      }

      if (filters.location && filters.location !== "All") {
        const loc = filters.location.toLowerCase();
        listings = listings.filter((l) =>
          l.location.toLowerCase().includes(loc),
        );
      }

      // Advanced Filter: Price Range
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        if (min !== undefined) {
          listings = listings.filter((l) => l.price >= min);
        }
        if (max !== undefined) {
          listings = listings.filter((l) => l.price <= max);
        }
      }

      // Advanced Filter: Date Range (listedAfter, listedBefore)
      if (filters.dateRange) {
        const { listedAfter, listedBefore } = filters.dateRange;
        if (listedAfter) {
          const afterTimestamp = Timestamp.fromDate(listedAfter);
          listings = listings.filter((l) => {
            // Get createdAt from document data if available
            const listingData = querySnapshot.docs
              .find((doc) => doc.id === l.id)
              ?.data();
            const createdAt = listingData?.createdAt as Timestamp | undefined;
            return createdAt && createdAt.seconds >= afterTimestamp.seconds;
          });
        }
        if (listedBefore) {
          const beforeTimestamp = Timestamp.fromDate(listedBefore);
          listings = listings.filter((l) => {
            const listingData = querySnapshot.docs
              .find((doc) => doc.id === l.id)
              ?.data();
            const createdAt = listingData?.createdAt as Timestamp | undefined;
            return createdAt && createdAt.seconds <= beforeTimestamp.seconds;
          });
        }
      }

      // Advanced Filter: Land Size Range
      if (filters.landSizeRange) {
        const { min, max } = filters.landSizeRange;
        if (min !== undefined) {
          listings = listings.filter((l) => {
            // Extract numeric value from landSize string (e.g., "1,000 sq ft" -> 1000)
            const sizeMatch = l.landSize.match(/[\d,]+/);
            if (!sizeMatch) return false;
            const size = parseInt(sizeMatch[0].replace(/,/g, ""), 10);
            return !isNaN(size) && size >= min;
          });
        }
        if (max !== undefined) {
          listings = listings.filter((l) => {
            const sizeMatch = l.landSize.match(/[\d,]+/);
            if (!sizeMatch) return false;
            const size = parseInt(sizeMatch[0].replace(/,/g, ""), 10);
            return !isNaN(size) && size <= max;
          });
        }
      }

      // Client-side search filtering
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        listings = listings.filter(
          (listing) =>
            listing.title.toLowerCase().includes(query) ||
            listing.location.toLowerCase().includes(query) ||
            listing.description?.toLowerCase().includes(query),
        );
      }

      // Cache the filtered result
      listingsCache.set(cacheKey, listings);

      return listings;
    } catch (error) {
      console.error("Error filtering listings:", error);
      throw error;
    }
  });
};

// API: Create listing with minimal data first, returns ID for image uploads (Admin only)
// This solves the issue where images need a real listingId before the document exists
export const createListingWithId = async (
  listing: Omit<Listing, "id">,
): Promise<string> => {
  // Check authentication status
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("Error creating listing: User not authenticated");
    throw new Error("User not authenticated. Please log in again.");
  }

  // Input validation removed to allow placeholder creation for IDs.
  // Full validation is performed in the UI before final save/update.

  console.log("Creating listing with user:", {
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
  });

  const listingsRef = collection(db, LISTINGS_COLLECTION);
  const docRef = await addDoc(listingsRef, {
    ...listing,
    status: listing.status || "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log("Listing created successfully:", docRef.id);

  // Invalidate cache after creating listing
  invalidateListingCache();

  return docRef.id;
};

// API: Create listing (Admin only) - backwards compatible
export const createListing = async (
  listing: Omit<Listing, "id">,
): Promise<string | null> => {
  try {
    return await createListingWithId(listing);
  } catch (error: any) {
    console.error("Error creating listing:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      currentUser: auth.currentUser?.email,
    });
    throw error; // Re-throw to show error in UI
  }
};

// Firestore rejects undefined; recursively remove undefined values before update
const stripUndefined = (
  obj: Record<string, unknown>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      !(v instanceof Timestamp)
    ) {
      out[k] = stripUndefined(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
};

// API: Update listing (Admin only)
export const updateListing = async (
  id: string,
  updates: Partial<Listing>,
): Promise<boolean> => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    const clean = stripUndefined({ ...updates, updatedAt: Timestamp.now() });
    await updateDoc(docRef, clean as Record<string, unknown>);

    // Invalidate cache after updating listing
    invalidateListingCache(id);

    return true;
  } catch (error) {
    console.error("Error updating listing:", error);
    return false;
  }
};

// API: Delete listing (Admin only)
// Deletes the Firestore document and all associated Storage files
export const deleteListing = async (id: string): Promise<boolean> => {
  try {
    // First, get the listing to find associated files
    const listing = await getListingById(id);
    if (!listing) {
      console.error("Listing not found:", id);
      return false;
    }

    // Delete all associated Storage files
    const storagePathsToDelete: string[] = [];

    // Add images
    if (listing.images && listing.images.length > 0) {
      // Extract file paths from URLs
      listing.images.forEach((url) => {
        try {
          const filePath = extractPathFromUrl(url);
          if (filePath) storagePathsToDelete.push(filePath);
        } catch (e) {
          console.warn("Failed to extract path from URL:", url);
        }
      });
    }

    // Add main image
    if (listing.imageUrl) {
      try {
        const filePath = extractPathFromUrl(listing.imageUrl);
        if (filePath) storagePathsToDelete.push(filePath);
      } catch (e) {
        console.warn("Failed to extract path from URL:", listing.imageUrl);
      }
    }

    // Add video
    if (listing.videoUrl) {
      try {
        const filePath = extractPathFromUrl(listing.videoUrl);
        if (filePath) storagePathsToDelete.push(filePath);
      } catch (e) {
        console.warn("Failed to extract path from URL:", listing.videoUrl);
      }
    }

    // Add audio
    if (listing.audioUrl) {
      try {
        const filePath = extractPathFromUrl(listing.audioUrl);
        if (filePath) storagePathsToDelete.push(filePath);
      } catch (e) {
        console.warn("Failed to extract path from URL:", listing.audioUrl);
      }
    }

    // Add 360 panoramas
    if (listing.panorama360 && listing.panorama360.length > 0) {
      listing.panorama360.forEach((url) => {
        try {
          const filePath = extractPathFromUrl(url);
          if (filePath) storagePathsToDelete.push(filePath);
        } catch (e) {
          console.warn("Failed to extract path from URL:", url);
        }
      });
    }

    // Delete all files from Storage
    const deletePromises = storagePathsToDelete.map((path) => deleteFile(path));
    const results = await Promise.allSettled(deletePromises);

    const deletedCount = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Deleted ${deletedCount} files for listing ${id}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`,
    );

    // Finally, delete the Firestore document
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await deleteDoc(docRef);

    // Invalidate cache after deleting listing
    invalidateListingCache(id);

    return true;
  } catch (error) {
    console.error("Error deleting listing:", error);
    return false;
  }
};

// Helper: Extract storage path from Firebase Storage URL
// URLs are in format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Ffile?token=...
function extractPathFromUrl(url: string): string | null {
  try {
    // Match the path portion between /o/ and ?
    const match = url.match(/\/o\/([^?]+)/);
    if (match && match[1]) {
      // URL decode the path
      return decodeURIComponent(match[1]);
    }
  } catch (e) {
    console.warn("Failed to parse Storage URL:", url);
  }
  return null;
}

// Storage: List files in a folder and return download URLs
export const listStorageFolder = async (
  folderPath: string,
): Promise<{ name: string; url: string; contentType?: string }[]> => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    const items: { name: string; url: string; contentType?: string }[] = [];
    for (const itemRef of result.items) {
      const url = await getDownloadURL(itemRef);
      items.push({ name: itemRef.name, url });
    }
    return items;
  } catch (error) {
    console.error("Error listing storage folder:", error);
    return [];
  }
};

// Storage: Upload file or blob (for WebP conversion)
export const uploadFile = async (
  file: File | Blob,
  path: string,
): Promise<string | null> => {
  try {
    // Check authentication status
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("Error uploading file: User not authenticated");
      throw new Error("User not authenticated. Please log in again.");
    }

    console.log("Uploading file with user:", {
      uid: currentUser.uid,
      email: currentUser.email,
      path: path,
    });

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("File uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      path: path,
      currentUser: auth.currentUser?.email,
    });
    throw error; // Re-throw to show error in UI
  }
};

// Storage: Delete file
export const deleteFile = async (path: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Auth: Sign in
export const signIn = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

// Auth: Create user (for initial setup in emulator)
export const createUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

// Auth: Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Auth: Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth: Listen to auth state changes
export const onAuthChange = (
  callback: (user: User | null) => void,
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// =============================================================================
// PERFORMANCE OPTIMIZATION: Cache Management
// =============================================================================

/**
 * Invalidate specific caches for listing updates
 * Call this after creating, updating, or deleting a listing
 */
export const invalidateListingCache = (listingId?: string): void => {
  // Clear general caches
  listingsCache.clear();
  paginatedCache.clear();

  // Clear specific listing cache if ID provided
  if (listingId) {
    listingCache.delete(`listing::${listingId}`);
  } else {
    listingCache.clear();
  }
};

/**
 * Clear all caches (useful for logout or forced refresh)
 */
export const clearAllCaches = (): void => {
  listingsCache.clear();
  listingCache.clear();
  paginatedCache.clear();
  requestDeduplicator.clear();
};

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = (): {
  listingsCache: { size: number };
  listingCache: { size: number };
  paginatedCache: { size: number };
  pendingRequests: number;
} => {
  return {
    listingsCache: { size: (listingsCache as any).cache?.size || 0 },
    listingCache: { size: (listingCache as any).cache?.size || 0 },
    paginatedCache: { size: (paginatedCache as any).cache?.size || 0 },
    pendingRequests: (requestDeduplicator as any).pendingRequests?.size || 0,
  };
};

// =============================================================================
// P2 TASK 3: IMAGE OPTIMIZATION SUPPORT
// =============================================================================

/**
 * Image size presets for different use cases
 * These are standard sizes for responsive images
 */
export type ImageSize = "thumbnail" | "medium" | "large";

export interface ImageSizeConfig {
  width: number;
  height: number;
  quality: number;
}

export const IMAGE_SIZE_CONFIGS: Record<ImageSize, ImageSizeConfig> = {
  thumbnail: { width: 200, height: 150, quality: 80 },
  medium: { width: 800, height: 600, quality: 85 },
  large: { width: 1200, height: 900, quality: 90 },
};

/**
 * Generate resized image URL from Firebase Storage
 * Uses Firebase Image Resizer extension or manual naming convention
 *
 * @param url - Original Firebase Storage URL
 * @param size - Desired image size
 * @returns URL for the resized image
 *
 * IMPLEMENTATION OPTIONS:
 *
 * Option 1: Firebase Image Resizer Extension (Recommended)
 * - Install Firebase Extension: Image Resizer
 * - Automatically generates thumbnails when images are uploaded
 * - URL pattern: /path/to/image_[width]x[height].ext
 *
 * Option 2: Manual naming convention
 * - Upload multiple sizes manually
 * - URL pattern: /path/to/image_{size}.ext
 *
 * Option 3: Cloudinary or similar CDN
 * - Use CDN URL transformation parameters
 * - URL pattern: https://cdn.example.com/image/w_{width},h_{height}/path
 *
 * Current implementation uses Option 2 (manual naming convention)
 */
export const getResizedImageUrl = (url: string, size: ImageSize): string => {
  try {
    // Check if URL is a Firebase Storage URL
    if (!url.includes("firebasestorage.googleapis.com")) {
      // For non-Firebase URLs, return as-is
      return url;
    }

    const config = IMAGE_SIZE_CONFIGS[size];
    const { width, height } = config;

    // Extract file path from URL
    // URLs are in format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Ffile?token=...
    const pathMatch = url.match(/\/o\/([^?]+)/);
    if (!pathMatch) {
      console.warn("Invalid Firebase Storage URL:", url);
      return url;
    }

    const filePath = decodeURIComponent(pathMatch[1]);
    const tokenMatch = url.match(/[?&]token=([^&]+)/);
    const token = tokenMatch ? `?token=${tokenMatch[1]}` : "";

    // Extract filename and extension
    const lastSlash = filePath.lastIndexOf("/");
    const fileName =
      lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
    const directory =
      lastSlash >= 0 ? filePath.substring(0, lastSlash + 1) : "";
    const lastDot = fileName.lastIndexOf(".");
    const nameWithoutExt =
      lastDot >= 0 ? fileName.substring(0, lastDot) : fileName;
    const extension = lastDot >= 0 ? fileName.substring(lastDot) : "";

    // Generate resized image path using naming convention
    const resizedFileName = `${nameWithoutExt}_${width}x${height}${extension}`;
    const resizedPath = `${directory}${resizedFileName}`;

    // Return resized URL
    return `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(resizedPath)}${token}`;
  } catch (error) {
    console.error("Error generating resized image URL:", error);
    return url;
  }
};

/**
 * Upload optimized image with multiple sizes
 * Generates WebP version and multiple resolutions
 *
 * @param file - Original image file
 * @param path - Storage path for the image (without filename)
 * @param options - Upload options
 * @returns Object with URLs for all generated sizes
 *
 * IMPLEMENTATION REQUIREMENTS:
 *
 * For automatic image optimization, you have several options:
 *
 * Option 1: Firebase Image Resizer Extension (Recommended)
 * - Install: https://extensions.dev/extensions/firebase/resize-images
 * - Configure output sizes and formats
 * - Automatically processes uploaded images
 * - No code changes required after setup
 *
 * Option 2: Cloud Functions + Sharp library
 * - Requires Cloud Functions deployment
 * - Use Sharp library for image processing
 * - Trigger on storage upload
 *
 * Option 3: Client-side processing (current implementation)
 * - Use Canvas API or browser libraries
 * - Generate WebP and multiple sizes in browser
 * - Upload all versions
 *
 * Current implementation is a placeholder for Option 3
 * For production, use Option 1 or Option 2 for better performance
 */
export const uploadOptimizedImage = async (
  file: File,
  path: string,
  options?: {
    generateWebP?: boolean;
    sizes?: ImageSize[];
    quality?: number;
  },
): Promise<{
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  webp?: string;
}> => {
  try {
    // Default options
    const generateWebP = options?.generateWebP !== false;
    const sizes = options?.sizes || ["medium", "large"];
    const quality = options?.quality || 85;

    // Upload original image
    const originalFileName = `${Date.now()}_${file.name}`;
    const originalPath = `${path}/${originalFileName}`;
    const originalUrl = await uploadFile(file, originalPath);

    if (!originalUrl) {
      throw new Error("Failed to upload original image");
    }

    const result: any = {
      original: originalUrl,
    };

    // NOTE: This is a simplified implementation
    // For production, use one of the options described in the function docstring

    // Client-side WebP conversion (if browser supports it)
    if (generateWebP && typeof window !== "undefined") {
      try {
        const webpUrl = await convertToWebP(file, path, quality);
        if (webpUrl) {
          result.webp = webpUrl;
        }
      } catch (error) {
        console.warn("WebP conversion not supported:", error);
      }
    }

    // Client-side thumbnail generation (simplified)
    // For production, use a proper image processing library
    if (sizes.includes("thumbnail")) {
      // Placeholder: In production, generate actual thumbnail
      // For now, just note that thumbnail generation requires additional setup
      console.log(
        "Thumbnail generation requires Firebase Image Resizer extension",
      );
    }

    return result;
  } catch (error) {
    console.error("Error uploading optimized image:", error);
    throw error;
  }
};

/**
 * Convert image to WebP format (client-side)
 * Helper function for uploadOptimizedImage
 *
 * @param file - Original image file
 * @param path - Storage path
 * @param quality - WebP quality (0-100)
 * @returns Download URL of WebP image
 */
const convertToWebP = async (
  file: File,
  path: string,
  quality: number,
): Promise<string | null> => {
  try {
    // Check if browser supports WebP
    if (typeof window === "undefined" || !window.createImageBitmap) {
      return null;
    }

    // Create image element
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    const webpUrl: string | null = await new Promise((resolve) => {
      img.onload = async () => {
        try {
          // Create canvas
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image to canvas
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0);

          // Convert to WebP
          const webpDataUrl = canvas.toDataURL("image/webp", quality / 100);

          // Convert Data URL to Blob
          const fetchResponse = await fetch(webpDataUrl);
          const blob = await fetchResponse.blob();

          // Upload WebP version
          const webpFileName = `${Date.now()}_${file.name.replace(/\.[^.]+$/, "")}.webp`;
          const webpPath = `${path}/${webpFileName}`;
          const url = await uploadFile(blob, webpPath);

          URL.revokeObjectURL(imageUrl);
          resolve(url || null);
        } catch (error) {
          console.error("Error converting to WebP:", error);
          URL.revokeObjectURL(imageUrl);
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(null);
      };

      img.src = imageUrl;
    });

    return webpUrl;
  } catch (error) {
    console.error("Error in WebP conversion:", error);
    return null;
  }
};

/**
 * Get all image URLs for a listing (original + all sizes)
 * Helper function to retrieve all available image versions
 *
 * @param originalUrl - Original image URL
 * @returns Object with URLs for all available sizes
 */
export const getAllImageSizes = (
  originalUrl: string,
): {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
} => {
  return {
    original: originalUrl,
    thumbnail: getResizedImageUrl(originalUrl, "thumbnail"),
    medium: getResizedImageUrl(originalUrl, "medium"),
    large: getResizedImageUrl(originalUrl, "large"),
  };
};

// =============================================================================
// P2 TASK 2: DASHBOARD BATCH OPERATIONS
// =============================================================================

/**
 * Get count of active listings (status = "active")
 * Used for dashboard statistics
 *
 * @returns Count of active listings
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const listingsRef = collection(db, LISTINGS_COLLECTION);
 * const q = query(listingsRef, where("status", "==", "active"));
 * const snapshot = await getDocs(q);
 * return snapshot.size;
 * ```
 */
export const getActiveListingCount = async (): Promise<number> => {
  try {
    // MOCK: Return mock data for development
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 38;

    // REAL IMPLEMENTATION (uncomment when ready):
    /*
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const q = query(listingsRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);
    return snapshot.size;
    */
  } catch (error) {
    console.error("Error getting active listing count:", error);
    return 0;
  }
};

/**
 * Get count of sold listings (status = "sold")
 * Used for dashboard statistics
 *
 * @returns Count of sold listings
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const listingsRef = collection(db, LISTINGS_COLLECTION);
 * const q = query(listingsRef, where("status", "==", "sold"));
 * const snapshot = await getDocs(q);
 * return snapshot.size;
 * ```
 */
export const getSoldListingCount = async (): Promise<number> => {
  try {
    // MOCK: Return mock data for development
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 7;

    // REAL IMPLEMENTATION (uncomment when ready):
    /*
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const q = query(listingsRef, where("status", "==", "sold"));
    const snapshot = await getDocs(q);
    return snapshot.size;
    */
  } catch (error) {
    console.error("Error getting sold listing count:", error);
    return 0;
  }
};

/**
 * Get total views from analytics
 * Aggregates view counts from analytics collection
 *
 * @returns Total view count across all listings
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * // Using Firestore aggregate queries for efficiency
 * const analyticsRef = collection(db, "analytics", "listingViews");
 * const aggregateSnapshot = await getAggregateFromServer(analyticsRef, {
 *   totalViews: sum("views")
 * });
 * return aggregateSnapshot.data().totalViews;
 * ```
 */
export const getTotalViews = async (): Promise<number> => {
  try {
    // MOCK: Return mock data for development
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 15230;

    // REAL IMPLEMENTATION (uncomment when analytics collection is ready):
    /*
    // Using Firestore aggregate queries for efficiency
    const analyticsRef = collection(db, "analytics", "listingViews");
    const aggregateSnapshot = await getAggregateFromServer(analyticsRef, {
      totalViews: sum("views")
    });
    return aggregateSnapshot.data().totalViews;
    */
  } catch (error) {
    console.error("Error getting total views:", error);
    return 0;
  }
};

/**
 * Get recent activity (listings created, updated, or sold)
 * Returns recent changes for dashboard activity feed
 *
 * @param limit - Maximum number of items to return (default: 10)
 * @returns Array of recent activity items
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const listingsRef = collection(db, LISTINGS_COLLECTION);
 * const q = query(
 *   listingsRef,
 *   orderBy("updatedAt", "desc"),
 *   limit(limit)
 * );
 * const snapshot = await getDocs(q);
 * return snapshot.docs.map(doc => {
 *   const data = doc.data();
 *   return {
 *     listingId: doc.id,
 *     title: data.title,
 *     action: data.status === "sold" ? "sold" : data.createdAt === data.updatedAt ? "created" : "updated",
 *     timestamp: data.updatedAt?.toDate() || new Date(),
 *     status: data.status
 *   };
 * });
 * ```
 */
export const getRecentActivity = async (
  activityLimit: number = 10,
): Promise<
  Array<{
    listingId: string;
    title: string;
    action: "created" | "updated" | "sold";
    timestamp: Date;
    status: string;
  }>
> => {
  try {
    // MOCK: Return mock data for development
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
      {
        listingId: "listing3",
        title: "Prime Industrial Warehouse",
        action: "updated",
        timestamp: new Date("2025-02-14T11:30:00"),
        status: "active",
      },
      {
        listingId: "listing1",
        title: "Modern Office Space",
        action: "created",
        timestamp: new Date("2025-02-14T10:15:00"),
        status: "active",
      },
      {
        listingId: "listing2",
        title: "Commercial Retail Space",
        action: "sold",
        timestamp: new Date("2025-02-14T09:00:00"),
        status: "sold",
      },
    ].slice(0, activityLimit);

    // REAL IMPLEMENTATION (uncomment when ready):
    /*
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const q = query(
      listingsRef,
      orderBy("updatedAt", "desc"),
      limit(activityLimit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      const updatedAt = data.updatedAt?.toDate();

      // Determine action based on timestamps and status
      let action: "created" | "updated" | "sold";
      if (data.status === "sold") {
        action = "sold";
      } else if (createdAt && updatedAt && createdAt.getTime() === updatedAt.getTime()) {
        action = "created";
      } else {
        action = "updated";
      }

      return {
        listingId: doc.id,
        title: data.title || "",
        action,
        timestamp: updatedAt || new Date(),
        status: data.status || "active",
      };
    });
    */
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
};

/**
 * Get listings grouped by category
 * Returns category distribution for dashboard charts
 *
 * @returns Object with category counts
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * // For large datasets, use Cloud Functions to pre-aggregate
 * // For small/medium datasets, client-side aggregation is acceptable
 * const listingsRef = collection(db, LISTINGS_COLLECTION);
 * const q = query(listingsRef, where("status", "==", "active"));
 * const snapshot = await getDocs(q);
 * const categoryCounts: Record<string, number> = {};
 * snapshot.docs.forEach((doc) => {
 *   const category = doc.data().category;
 *   categoryCounts[category] = (categoryCounts[category] || 0) + 1;
 * });
 * return categoryCounts;
 * ```
 */
export const getListingsByCategory = async (): Promise<
  Record<string, number>
> => {
  try {
    // MOCK: Return mock data for development
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      Commercial: 12,
      Industrial: 15,
      Land: 6,
      Office: 5,
    };

    // REAL IMPLEMENTATION (uncomment when ready):
    /*
    // For large datasets, use Cloud Functions to pre-aggregate
    // For small/medium datasets, client-side aggregation is acceptable
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    const q = query(listingsRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);
    const categoryCounts: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const category = doc.data().category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    return categoryCounts;
    */
  } catch (error) {
    console.error("Error getting listings by category:", error);
    return {};
  }
};
