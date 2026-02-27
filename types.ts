export enum ListingType {
  SALE = "SALE",
  RENT = "RENT",
}

export enum PropertyCategory {
  COMMERCIAL = "Commercial",
  INDUSTRIAL = "Industrial",
  LAND = "Land",
  OFFICE = "Office",
}

// Specifications from fact sheet (optional)
export interface ListingSpecifications {
  landTitleNo?: string;
  district?: string;
  mukim?: string;
  landUseCategory?: string;
  buildUpArea?: string;
  ceilingHeights?: string;
  powerSupply?: string;
  floorLoad?: string;
  currentStatus?: string;
  viewingPIC?: string;
  googleMapLink?: string;
  tenureExplanation?: string;
}

// AI extraction result (maps to Listing)
export interface ListingExtraction {
  title?: string;
  address?: string;
  propertyType?: string;
  tenure?: "Freehold" | "Leasehold";
  price?: number;
  landSize?: string;
  buildUpArea?: string;
  lotNumbers?: string;
  ceilingHeights?: string;
  powerSupply?: string;
  floorLoad?: string;
  currentStatus?: string;
  viewingPIC?: string;
  googleMapLink?: string;
  otherRemarks?: string;
  specifications?: Partial<ListingSpecifications>;
}

// Firestore types for getDocs
export type QueryDocumentData = QueryDocumentSnapshot<DocumentData, DocumentData>;
export type QueryDocumentSnapshot = QuerySnapshot<QueryDocumentData, QueryDocumentData>;
export type QueryDocumentData = DocumentData;
export type QueryDocumentSnapshot = QuerySnapshot<DocumentData, DocumentData>;

// getDocs function return type
export interface GetDocsResponse {
  data: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
  hasMore: boolean;
  nextPageCursor: string | null;
}

// Function signature for getDocs
export interface GetDocsFunction {
  (q: string): GetDocsResponse;
}

export type ListingStatus = "active" | "inactive" | "sold";

export type ListingActionType = "sold" | "created" | "updated";

export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: PropertyCategory;
  type: ListingType;
  landSize: string;
  tenure: "Freehold" | "Leasehold";
  imageUrl: string;
  featured?: boolean;
  status?: ListingStatus; // active, inactive, or sold
  // Multimedia fields for Package 3
  images?: string[]; // Array of image URLs for carousel
  videoUrl?: string; // Video URL for property tour
  audioUrl?: string; // Audio narration URL
  panorama360?: string[]; // Array of 360 panorama image URLs
  description?: string; // Full property description
  coordinates?: { lat: number; lng: number }; // Map coordinates
  propertyGuruUrl?: string; // Link to PropertyGuru listing
  iPropertyUrl?: string; // Link to iProperty listing
  specifications?: ListingSpecifications; // From fact sheet
}

export interface AgentProfile {
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
}

export interface FilterState {
  listingType: ListingType;
  category: PropertyCategory | "All";
  location: string | "All";
  searchQuery: string;
}

export interface AppState extends FilterState {
  selectedListing: Listing | null;
  isDetailModalOpen: boolean;
  multimediaPlaybackState: {
    videoPlaying: boolean;
    audioPlaying: boolean;
    currentImageIndex: number;
  };
}

// Multimedia playback state
export interface MultimediaPlaybackState {
  videoPlaying: boolean;
  audioPlaying: boolean;
  currentImageIndex: number;
}
