/**
 * Analytics Data Service
 * Provides backend data queries for listing and agent analytics.
 *
 * FIRESTORE ANALYTICS COLLECTION STRUCTURE:
 *
 * /analytics/{date}/stats - Daily aggregated statistics
 *   - date: "2025-02-14" (YYYY-MM-DD format)
 *   - stats: {
 *       totalViews: number,
 *       totalClicks: number,
 *       totalSearches: number,
 *       uniqueVisitors: number,
 *       updatedAt: Timestamp
 *     }
 *
 * /analytics/listingViews/{listingId}/{date} - Daily listing view tracking
 *   - listingId: string
 *   - date: "2025-02-14"
 *   - views: number
 *   - uniqueViewers: number
 *   - lastViewedAt: Timestamp
 *
 * /analytics/searchTerms/{termId} - Search term frequency tracking
 *   - termId: string (normalized search term)
 *   - searchTerm: string
 *   - frequency: number
 *   - lastSearched: Timestamp
 *   - filters: AdvancedFilterState (last used filters)
 *   - firstSearched: Timestamp
 *
 * /analytics/events/{eventId} - Individual event tracking
 *   - eventId: string (auto-generated)
 *   - eventType: "listing_view" | "listing_click" | "search" | "contact_click"
 *   - listingId?: string
 *   - userId?: string
 *   - metadata: Record<string, any>
 *   - timestamp: Timestamp
 *
 * FIRESTORE INDEX REQUIREMENTS:
 * 1. Composite index on analytics/listingViews: (listingId, date) DESC
 * 2. Composite index on analytics/searchTerms: (frequency DESC, lastSearched DESC)
 * 3. Composite index on analytics/events: (eventType, timestamp) DESC
 *
 * Create indexes in Firebase Console: Firestore > Indexes > Create Index
 */

import { Listing, ListingStats, AgentStats, PopularListing, SearchAnalytics, AdvancedFilterState, DateRange } from "../types";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getAggregateFromServer,
  sum,
  count,
  Timestamp,
  runTransaction,
} from "firebase/firestore";

// =============================================================================
// ANALYTICS COLLECTION CONSTANTS
// =============================================================================

const ANALYTICS_COLLECTION = "analytics";
const LISTING_VIEWS_SUBCOLLECTION = "listingViews";
const SEARCH_TERMS_SUBCOLLECTION = "searchTerms";
const EVENTS_SUBCOLLECTION = "events";
const STATS_DOCUMENT = "stats";

// =============================================================================
// FALLBACK MOCK DATA - Used when Firestore is not available
// =============================================================================

// Mock listing stats (listingId -> stats)
const mockListingStats: Record<string, ListingStats> = {
  "listing1": {
    listingId: "listing1",
    totalViews: 1250,
    totalClicks: 342,
    lastViewedAt: new Date("2025-02-14T10:30:00"),
  },
  "listing2": {
    listingId: "listing2",
    totalViews: 890,
    totalClicks: 201,
    lastViewedAt: new Date("2025-02-14T09:15:00"),
  },
  "listing3": {
    listingId: "listing3",
    totalViews: 2100,
    totalClicks: 567,
    lastViewedAt: new Date("2025-02-14T11:45:00"),
  },
};

// Mock search analytics
const mockSearchAnalytics: SearchAnalytics[] = [
  {
    searchTerm: "commercial office space",
    frequency: 45,
    lastSearched: new Date("2025-02-14T12:00:00"),
    filters: {
      listingType: "SALE" as any,
      category: "Office" as any,
      location: "All",
      searchQuery: "commercial office space",
    },
  },
  {
    searchTerm: "industrial warehouse",
    frequency: 32,
    lastSearched: new Date("2025-02-14T11:30:00"),
    filters: {
      listingType: "RENT" as any,
      category: "Industrial" as any,
      location: "All",
      searchQuery: "industrial warehouse",
    },
  },
  {
    searchTerm: "land for development",
    frequency: 28,
    lastSearched: new Date("2025-02-14T10:00:00"),
    filters: {
      listingType: "SALE" as any,
      category: "Land" as any,
      location: "All",
      searchQuery: "land for development",
    },
  },
];

// =============================================================================
// ANALYTICS QUERY FUNCTIONS
// =============================================================================

/**
 * Get statistics for a specific listing
 * @param listingId - The ID of the listing
 * @returns Listing statistics including views, clicks, and last viewed date
 *
 * TODO: Connect to Firebase Analytics or Firestore analytics collection
 */
export const getListingStats = async (listingId: string): Promise<ListingStats | null> => {
  try {
    // MOCK: Return mock data for demo purposes
    // Real implementation would query analytics collection
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    const stats = mockListingStats[listingId];
    if (stats) {
      return stats;
    }

    // Return default stats for listings without specific data
    return {
      listingId,
      totalViews: Math.floor(Math.random() * 500) + 50,
      totalClicks: Math.floor(Math.random() * 100) + 10,
      lastViewedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error fetching stats for listing ${listingId}:`, error);
    return null;
  }
};

/**
 * Get statistics for multiple listings
 * @param listingIds - Array of listing IDs
 * @returns Map of listing ID to stats
 */
export const getMultipleListingStats = async (
  listingIds: string[]
): Promise<Record<string, ListingStats>> => {
  try {
    const statsPromises = listingIds.map(async (id) => {
      const stats = await getListingStats(id);
      return { id, stats };
    });

    const results = await Promise.all(statsPromises);
    const statsMap: Record<string, ListingStats> = {};

    results.forEach(({ id, stats }) => {
      if (stats) {
        statsMap[id] = stats;
      }
    });

    return statsMap;
  } catch (error) {
    console.error("Error fetching multiple listing stats:", error);
    return {};
  }
};

/**
 * Get agent performance statistics
 * @returns Agent statistics including total listings, deals closed, and response rate
 *
 * TODO: Connect to agent profile and deal tracking system
 */
export const getAgentStats = async (): Promise<AgentStats> => {
  try {
    // MOCK: Return mock agent stats
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    return {
      totalListings: 45,
      activeListings: 38,
      dealsClosed: 23,
      responseRate: 87, // 87%
      averageResponseTime: 2.5, // 2.5 hours
    };
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return {
      totalListings: 0,
      activeListings: 0,
      dealsClosed: 0,
      responseRate: 0,
    };
  }
};

/**
 * Get most viewed/popular listings
 * @param limit - Maximum number of popular listings to return (default: 10)
 * @returns Array of popular listings with view counts and rankings
 *
 * TODO: Connect to real analytics data and listings collection
 */
export const getPopularListings = async (limit: number = 10): Promise<PopularListing[]> => {
  try {
    // MOCK: Return mock popular listings
    await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay

    const mockPopular: PopularListing[] = [
      {
        listing: {
          id: "listing3",
          title: "Prime Industrial Warehouse",
          price: 2500000,
          location: "Jurong Industrial Estate",
          category: "Industrial" as any,
          type: "SALE" as any,
          landSize: "15,000 sq ft",
          tenure: "Freehold",
          imageUrl: "",
          status: "active" as any,
        },
        viewCount: 2100,
        rank: 1,
      },
      {
        listing: {
          id: "listing1",
          title: "Modern Office Space",
          price: 850000,
          location: "CBD Area",
          category: "Office" as any,
          type: "SALE" as any,
          landSize: "2,500 sq ft",
          tenure: "Leasehold",
          imageUrl: "",
          status: "active" as any,
        },
        viewCount: 1250,
        rank: 2,
      },
      {
        listing: {
          id: "listing2",
          title: "Commercial Retail Space",
          price: 1200000,
          location: "Orchard Road",
          category: "Commercial" as any,
          type: "RENT" as any,
          landSize: "1,800 sq ft",
          tenure: "Leasehold",
          imageUrl: "",
          status: "active" as any,
        },
        viewCount: 890,
        rank: 3,
      },
    ];

    return mockPopular.slice(0, Math.min(limit, mockPopular.length));
  } catch (error) {
    console.error("Error fetching popular listings:", error);
    return [];
  }
};

/**
 * Get search term analytics
 * @param limit - Maximum number of search terms to return (default: 20)
 * @returns Array of search analytics with term frequencies and filters used
 *
 * TODO: Connect to real search tracking data
 */
export const getSearchAnalytics = async (limit: number = 20): Promise<SearchAnalytics[]> => {
  try {
    // MOCK: Return mock search analytics
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    return mockSearchAnalytics
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, Math.min(limit, mockSearchAnalytics.length));
  } catch (error) {
    console.error("Error fetching search analytics:", error);
    return [];
  }
};

/**
 * Track a listing view (call this when user views a listing)
 * @param listingId - The ID of the listing being viewed
 *
 * TODO: Implement real analytics tracking
 */
export const trackListingView = async (listingId: string): Promise<void> => {
  try {
    // MOCK: Log the view (in real implementation, this would update analytics)
    console.log(`[Analytics] Listing viewed: ${listingId} at ${new Date().toISOString()}`);

    // Real implementation would:
    // 1. Increment view counter in analytics collection
    // 2. Update lastViewedAt timestamp
    // 3. Optionally log detailed view event for analysis
  } catch (error) {
    console.error("Error tracking listing view:", error);
  }
};

/**
 * Track a listing click (call this when user clicks listing CTA)
 * @param listingId - The ID of the listing being clicked
 * @param clickType - Type of click (e.g., 'whatsapp', 'phone', 'email')
 *
 * TODO: Implement real analytics tracking
 */
export const trackListingClick = async (
  listingId: string,
  clickType: string
): Promise<void> => {
  try {
    // MOCK: Log the click (in real implementation, this would update analytics)
    console.log(`[Analytics] Listing clicked: ${listingId} (${clickType}) at ${new Date().toISOString()}`);

    // Real implementation would:
    // 1. Increment click counter in analytics collection
    // 2. Log click type for conversion tracking
    // 3. Update click-through-rate metrics
  } catch (error) {
    console.error("Error tracking listing click:", error);
  }
};

/**
 * Track a search query (call this when user performs a search)
 * @param searchTerm - The search query text
 * @param filters - The filters applied to the search
 *
 * TODO: Implement real analytics tracking
 */
export const trackSearch = async (
  searchTerm: string,
  filters: Record<string, any>
): Promise<void> => {
  try {
    // MOCK: Log the search (in real implementation, this would update analytics)
    console.log(`[Analytics] Search performed: "${searchTerm}" with filters:`, filters);

    // Real implementation would:
    // 1. Increment search term frequency counter
    // 2. Update lastSearched timestamp
    // 3. Log filter combinations for analysis
  } catch (error) {
    console.error("Error tracking search:", error);
  }
};

// =============================================================================
// AGGREGATED ANALYTICS (Advanced)
// =============================================================================

/**
 * Get aggregated analytics overview
 * @returns Overview stats for dashboard
 */
export const getAnalyticsOverview = async (): Promise<{
  totalViews: number;
  totalClicks: number;
  totalSearches: number;
  avgEngagementRate: number;
}> => {
  try {
    // MOCK: Return overview stats
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      totalViews: 15230,
      totalClicks: 3420,
      totalSearches: 892,
      avgEngagementRate: 22.5, // 22.5% click-through rate
    };
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return {
      totalViews: 0,
      totalClicks: 0,
      totalSearches: 0,
      avgEngagementRate: 0,
    };
  }
};

// =============================================================================
// P2 TASK 1: REAL ANALYTICS IMPLEMENTATION
// =============================================================================

/**
 * Get comprehensive analytics overview from Firestore
 * Provides total listings, active listings, sold listings, total views, and engagement rate
 *
 * @returns Overview with totalListings, activeListings, soldListings, totalViews, engagementRate
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * // Query listings collection for counts
 * const listingsRef = collection(db, "listings");
 * const activeQuery = query(listingsRef, where("status", "==", "active"));
 * const soldQuery = query(listingsRef, where("status", "==", "sold"));
 *
 * // Query analytics for total views (aggregate from listingViews)
 * const viewsRef = collection(db, ANALYTICS_COLLECTION, LISTING_VIEWS_SUBCOLLECTION);
 * const viewsSnapshot = await getDocs(viewsRef);
 * const totalViews = viewsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
 *
 * // Calculate engagement rate: (totalClicks / totalViews) * 100
 * ```
 */
export const getAnalyticsOverviewReal = async (): Promise<{
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  engagementRate: number;
}> => {
  try {
    // MOCK: Return mock data for development
    // TODO: Replace with real Firestore queries when analytics collection is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      totalListings: 45,
      activeListings: 38,
      soldListings: 7,
      totalViews: 15230,
      engagementRate: 22.5, // 22.5% click-through rate
    };

    // REAL IMPLEMENTATION (uncomment when Firestore analytics collection is ready):
    /*
    const listingsRef = collection(db, "listings");

    // Get total listings count
    const totalSnapshot = await getDocs(listingsRef);
    const totalListings = totalSnapshot.size;

    // Get active listings count
    const activeQuery = query(listingsRef, where("status", "==", "active"));
    const activeSnapshot = await getDocs(activeQuery);
    const activeListings = activeSnapshot.size;

    // Get sold listings count
    const soldQuery = query(listingsRef, where("status", "==", "sold"));
    const soldSnapshot = await getDocs(soldQuery);
    const soldListings = soldSnapshot.size;

    // Get total views from analytics
    const viewsRef = collection(db, ANALYTICS_COLLECTION, LISTING_VIEWS_SUBCOLLECTION);
    const viewsSnapshot = await getDocs(viewsRef);
    const totalViews = viewsSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().views || 0);
    }, 0);

    // Get total clicks from analytics
    const eventsRef = collection(db, ANALYTICS_COLLECTION, EVENTS_SUBCOLLECTION);
    const clickEventsQuery = query(eventsRef, where("eventType", "==", "listing_click"));
    const clickSnapshot = await getDocs(clickEventsQuery);
    const totalClicks = clickSnapshot.size;

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      totalListings,
      activeListings,
      soldListings,
      totalViews,
      engagementRate: Math.round(engagementRate * 10) / 10, // Round to 1 decimal
    };
    */
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return {
      totalListings: 0,
      activeListings: 0,
      soldListings: 0,
      totalViews: 0,
      engagementRate: 0,
    };
  }
};

/**
 * Get listing views over time for a specific listing
 * Returns daily view counts within the specified date range
 *
 * @param listingId - The ID of the listing
 * @param dateRange - Optional date range to filter views
 * @returns Array of daily view counts with dates
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const listingViewsRef = collection(db, ANALYTICS_COLLECTION, LISTING_VIEWS_SUBCOLLECTION);
 * const q = query(
 *   listingViewsRef,
 *   where("listingId", "==", listingId),
 *   orderBy("date", "desc")
 * );
 * ```
 */
export const getListingViews = async (
  listingId: string,
  dateRange?: DateRange
): Promise<Array<{ date: string; views: number }>> => {
  try {
    // MOCK: Return mock data for development
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockViews = [
      { date: "2025-02-14", views: 45 },
      { date: "2025-02-13", views: 38 },
      { date: "2025-02-12", views: 52 },
      { date: "2025-02-11", views: 29 },
      { date: "2025-02-10", views: 41 },
      { date: "2025-02-09", views: 35 },
      { date: "2025-02-08", views: 48 },
    ];

    // Filter by date range if provided
    if (dateRange?.listedAfter || dateRange?.listedBefore) {
      return mockViews.filter((item) => {
        const itemDate = new Date(item.date);
        if (dateRange.listedAfter && itemDate < dateRange.listedAfter) return false;
        if (dateRange.listedBefore && itemDate > dateRange.listedBefore) return false;
        return true;
      });
    }

    return mockViews;

    // REAL IMPLEMENTATION (uncomment when Firestore analytics collection is ready):
    /*
    const listingViewsRef = collection(db, ANALYTICS_COLLECTION, LISTING_VIEWS_SUBCOLLECTION);
    let q = query(
      listingViewsRef,
      where("listingId", "==", listingId),
      orderBy("date", "desc")
    );

    // Add date range filters if provided
    if (dateRange?.listedAfter) {
      const afterTimestamp = Timestamp.fromDate(dateRange.listedAfter);
      q = query(q, where("date", ">=", afterTimestamp));
    }
    if (dateRange?.listedBefore) {
      const beforeTimestamp = Timestamp.fromDate(dateRange.listedBefore);
      q = query(q, where("date", "<=", beforeTimestamp));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.date, // Format: "2025-02-14"
        views: data.views || 0,
      };
    });
    */
  } catch (error) {
    console.error(`Error fetching views for listing ${listingId}:`, error);
    return [];
  }
};

/**
 * Get most searched terms and locations
 * Returns search terms sorted by frequency
 *
 * @param dateRange - Optional date range to filter searches
 * @param limit - Maximum number of search terms to return (default: 20)
 * @returns Array of search analytics with term frequencies
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const searchTermsRef = collection(db, ANALYTICS_COLLECTION, SEARCH_TERMS_SUBCOLLECTION);
 * const q = query(
 *   searchTermsRef,
 *   orderBy("frequency", "desc"),
 *   orderBy("lastSearched", "desc"),
 *   limit(limit)
 * );
 * ```
 */
export const getSearchTerms = async (
  dateRange?: DateRange,
  limit: number = 20
): Promise<SearchAnalytics[]> => {
  try {
    // MOCK: Return mock data for development
    await new Promise(resolve => setTimeout(resolve, 100));

    let results = [...mockSearchAnalytics].sort((a, b) => b.frequency - a.frequency);

    // Filter by date range if provided
    if (dateRange?.listedAfter || dateRange?.listedBefore) {
      results = results.filter((item) => {
        if (dateRange.listedAfter && item.lastSearched < dateRange.listedAfter) return false;
        if (dateRange.listedBefore && item.lastSearched > dateRange.listedBefore) return false;
        return true;
      });
    }

    return results.slice(0, Math.min(limit, results.length));

    // REAL IMPLEMENTATION (uncomment when Firestore analytics collection is ready):
    /*
    const searchTermsRef = collection(db, ANALYTICS_COLLECTION, SEARCH_TERMS_SUBCOLLECTION);
    let q = query(
      searchTermsRef,
      orderBy("frequency", "desc"),
      orderBy("lastSearched", "desc"),
      limit(limit)
    );

    // Add date range filters if provided
    if (dateRange?.listedAfter) {
      const afterTimestamp = Timestamp.fromDate(dateRange.listedAfter);
      q = query(q, where("lastSearched", ">=", afterTimestamp));
    }
    if (dateRange?.listedBefore) {
      const beforeTimestamp = Timestamp.fromDate(dateRange.listedBefore);
      q = query(q, where("lastSearched", "<=", beforeTimestamp));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        searchTerm: data.searchTerm,
        frequency: data.frequency || 0,
        lastSearched: data.lastSearched?.toDate() || new Date(),
        filters: data.filters || {},
      };
    });
    */
  } catch (error) {
    console.error("Error fetching search terms:", error);
    return [];
  }
};

/**
 * Track an analytics event
 * Writes to the analytics collection for later analysis
 *
 * @param event - Event type: "listing_view" | "listing_click" | "search" | "contact_click"
 * @param data - Event metadata (listingId, clickType, searchTerm, filters, userId, etc.)
 * @returns void
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const eventsRef = collection(db, ANALYTICS_COLLECTION, EVENTS_SUBCOLLECTION);
 * await addDoc(eventsRef, {
 *   eventType: event,
 *   timestamp: Timestamp.now(),
 *   ...data
 * });
 * ```
 */
export const trackEvent = async (
  event: "listing_view" | "listing_click" | "search" | "contact_click",
  data: {
    listingId?: string;
    clickType?: string;
    searchTerm?: string;
    filters?: AdvancedFilterState;
    userId?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> => {
  try {
    // MOCK: Log the event for development
    console.log(`[Analytics] Event tracked: ${event}`, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // REAL IMPLEMENTATION (uncomment when Firestore analytics collection is ready):
    /*
    const eventsRef = collection(db, ANALYTICS_COLLECTION, EVENTS_SUBCOLLECTION);
    await addDoc(eventsRef, {
      eventType: event,
      timestamp: Timestamp.now(),
      listingId: data.listingId || null,
      clickType: data.clickType || null,
      searchTerm: data.searchTerm || null,
      filters: data.filters || null,
      userId: data.userId || null,
      metadata: data.metadata || {},
    });

    // Update aggregated stats for specific events
    if (event === "listing_view" && data.listingId) {
      await updateListingViewStats(data.listingId);
    }

    if (event === "search" && data.searchTerm) {
      await updateSearchTermStats(data.searchTerm, data.filters);
    }
    */
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};

/**
 * Update listing view statistics (helper function)
 * Increments view count for a listing
 *
 * @param listingId - The ID of the listing
 * @returns void
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
 * const viewDocRef = doc(db, ANALYTICS_COLLECTION, LISTING_VIEWS_SUBCOLLECTION, listingId, today);
 * await setDoc(viewDocRef, { views: increment(1), lastViewedAt: Timestamp.now() }, { merge: true });
 * ```
 */
const updateListingViewStats = async (listingId: string): Promise<void> => {
  try {
    // MOCK: Log for development
    console.log(`[Analytics] Updating view stats for listing: ${listingId}`);

    // REAL IMPLEMENTATION:
    /*
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const viewDocRef = doc(
      db,
      ANALYTICS_COLLECTION,
      LISTING_VIEWS_SUBCOLLECTION,
      listingId,
      today
    );
    await setDoc(
      viewDocRef,
      {
        listingId,
        date: today,
        views: 1, // Use increment(1) with firebase/firestore
        lastViewedAt: Timestamp.now(),
      },
      { merge: true }
    );
    */
  } catch (error) {
    console.error("Error updating listing view stats:", error);
  }
};

/**
 * Update search term statistics (helper function)
 * Increments frequency for a search term
 *
 * @param searchTerm - The search term
 * @param filters - The filters used with the search
 * @returns void
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * // Normalize search term for use as document ID
 * const termId = searchTerm.toLowerCase().trim().replace(/\s+/g, '-');
 * const termDocRef = doc(db, ANALYTICS_COLLECTION, SEARCH_TERMS_SUBCOLLECTION, termId);
 * await setDoc(termDocRef, {
 *   searchTerm,
 *   frequency: increment(1),
 *   lastSearched: Timestamp.now(),
 *   filters,
 * }, { merge: true });
 * ```
 */
const updateSearchTermStats = async (
  searchTerm: string,
  filters?: AdvancedFilterState
): Promise<void> => {
  try {
    // MOCK: Log for development
    console.log(`[Analytics] Updating search stats for term: ${searchTerm}`);

    // REAL IMPLEMENTATION:
    /*
    // Normalize search term for use as document ID
    const termId = searchTerm.toLowerCase().trim().replace(/\s+/g, '-');
    const termDocRef = doc(
      db,
      ANALYTICS_COLLECTION,
      SEARCH_TERMS_SUBCOLLECTION,
      termId
    );
    await setDoc(
      termDocRef,
      {
        searchTerm,
        frequency: 1, // Use increment(1) with firebase/firestore
        lastSearched: Timestamp.now(),
        firstSearched: Timestamp.now(), // Only set on first create
        filters: filters || {},
      },
      { merge: true }
    );
    */
  } catch (error) {
    console.error("Error updating search term stats:", error);
  }
};
