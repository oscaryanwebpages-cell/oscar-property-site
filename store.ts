import { create } from "zustand";
import { ListingType } from "./types";
import type {
  FilterState,
  Listing,
  PropertyCategory,
  AppState,
  AdvancedFilterState,
  ListingActionType,
} from "./types";

interface Store extends AppState {
  selectedListing: Listing | null;
  isDetailModalOpen: boolean;
  multimediaPlaybackState: {
    videoPlaying: boolean;
    audioPlaying: boolean;
    currentImageIndex: number;
  };
  // Advanced filters
  priceRange?: { min: number; max: number };
  dateRange?: { listedAfter?: Date; listedBefore?: Date };
  landSizeRange?: { min: number; max: number };
}

export const useStore = create<Store>((set, get) => ({
  // Filter state (initial values)
  listingType: ListingType.SALE,
  category: "All" as PropertyCategory | "All",
  location: "All",
  searchQuery: "",
  selectedListing: null,
  isDetailModalOpen: false,
  multimediaPlaybackState: {
    videoPlaying: false,
    audioPlaying: false,
    currentImageIndex: 0,
  },
  // Setters
  setListingType: (type) => set({ listingType: type }),
  setCategory: (category) => set({ category }),
  setLocation: (location) => set({ location }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedListing: (listing: Listing | null) =>
    set({ selectedListing: listing }),
  openDetailModal: (listing: Listing) =>
    set({
      selectedListing: listing,
      isDetailModalOpen: true,
      multimediaPlaybackState: {
        videoPlaying: false,
        audioPlaying: false,
        currentImageIndex: 0,
      },
    }),
  closeDetailModal: (listing: Listing) =>
    set({
      isDetailModalOpen: false,
      selectedListing: null,
    }),
  setVideoPlaying: (playing: boolean) =>
    set((state) => ({
      multimediaPlaybackState: {
        ...state.multimediaPlaybackState,
        videoPlaying: playing,
      },
    })),
  setAudioPlaying: (playing: boolean) =>
    set((state) => ({
      multimediaPlaybackState: {
        ...state.multimediaPlaybackState,
        audioPlaying: playing,
      },
    })),
  setCurrentImageIndex: (index: number) =>
    set((state) => ({
      multimediaPlaybackState: {
        ...state.multimediaPlaybackState,
        currentImageIndex: index,
      },
    })),
  setPriceRange: (range) => set({ priceRange: range }),
  setDateRange: (range) => set({ dateRange: range }),
  setLandSizeRange: (range) => set({ landSizeRange: range }),
  clearAdvancedFilters: () =>
    set({
      priceRange: undefined,
      dateRange: undefined,
      landSizeRange: undefined,
    }),
}));
