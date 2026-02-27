import { ListingType, PropertyCategory, ListingSpecifications } from '../types';

// Firestore document types with server timestamps
export interface FirestoreListing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: PropertyCategory;
  type: ListingType;
  landSize: string;
  tenure: 'Freehold' | 'Leasehold';
  imageUrl: string;
  featured: boolean;
  images: string[];
  videoUrl: string | null;
  audioUrl: string | null;
  panorama360: string[];
  description: string;
  coordinates: { lat: number; lng: number } | null;
  propertyGuruUrl: string | null;
  iPropertyUrl: string | null;
  status: 'active' | 'inactive' | 'sold';
  specifications?: ListingSpecifications;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreAgentProfile {
  name: string;
  title: string;
  agency: string;
  regNo: string;
  agencyLicense: string;
  phone: string;
  email: string;
  photoUrl: string;
  yearsExperience: number;
  listingsCount: number;
  dealsClosed: number;
  bio: string;
  updatedAt: Date;
}

export interface FirestoreTestimonial {
  id: string;
  clientName: string;
  transactionType: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: Date;
}

// Firestore collection names
export const COLLECTIONS = {
  LISTINGS: 'listings',
  AGENT_PROFILE: 'agentProfile',
  TESTIMONIALS: 'testimonials',
} as const;

// Storage paths
export const STORAGE_PATHS = {
  LISTING_IMAGES: (listingId: string) => `listings/${listingId}/images`,
  LISTING_VIDEOS: (listingId: string) => `listings/${listingId}/videos`,
  LISTING_AUDIO: (listingId: string) => `listings/${listingId}/audio`,
  LISTING_360: (listingId: string) => `listings/${listingId}/360`,
  AGENT_PROFILE: 'agent/profile',
} as const;
