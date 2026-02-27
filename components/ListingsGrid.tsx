import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useStore } from "../store";
import { LOCATIONS } from "../constants";
import {
  ListingType,
  PropertyCategory,
  Listing,
  PriceRange,
  DateRange,
  LandSizeRange,
} from "../types";
import ListingCard from "./ListingCard";
import SkeletonCard from "./ui/SkeletonCard";
import { Search, Filter, X, Calendar, MapPin } from "lucide-react";
import { filterListings } from "../services/firebase";
import { analytics } from "../services/analytics";
import { useToast } from "./ui/Toast";

// Interface for the ListingsGrid ref
export interface ListingsGridRef {
  refreshListings: () => void;
}

const ListingsGrid = forwardRef<ListingsGridRef>((props, ref) => {
  const toast = useToast();
  const {
    listingType,
    category,
    location,
    searchQuery,
    setListingType,
    setCategory,
    setLocation,
    setSearchQuery,
    priceRange,
    dateRange,
    landSizeRange,
    setPriceRange,
    setDateRange,
    setLandSizeRange,
    clearAdvancedFilters,
  } = useStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  // Advanced filter UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [listedAfter, setListedAfter] = useState("");
  const [listedBefore, setListedBefore] = useState("");
  const [landSizeMin, setLandSizeMin] = useState("");
  const [landSizeMax, setLandSizeMax] = useState("");
  const [datePreset, setDatePreset] = useState<string>("");
  const [sizePreset, setSizePreset] = useState<string>("");

  // Fetch listings from Firebase
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setUsingFallbackData(false);
      try {
        const filtered = await filterListings({
          listingType,
          category,
          location,
          searchQuery,
          priceRange,
          dateRange,
          landSizeRange,
        });
        console.log("Firebase listings result:", filtered.length, "listings");
        console.log("Filter criteria:", {
          listingType,
          category,
          location,
          searchQuery,
          priceRange,
          dateRange,
          landSizeRange,
        });
        setListings(filtered);
        setUsingFallbackData(false);
        setFetchError(null);
        analytics.filterApplied({
          listing_type: listingType,
          category,
          location,
          has_search: !!searchQuery,
          price_range: priceRange,
          date_range: dateRange,
          land_size_range: landSizeRange,
        });
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
        setUsingFallbackData(true);
        const msg = error instanceof Error ? error.message : String(error);
        setFetchError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [
    listingType,
    category,
    location,
    searchQuery,
    priceRange,
    dateRange,
    landSizeRange,
    triggerRefresh,
  ]);

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refreshListings: () => {
      setTriggerRefresh((prev) => prev + 1);
    },
  }));

  // Helper: Get active filter tags
  const getActiveFilterTags = () => {
    const tags: { label: string; onRemove: () => void }[] = [];

    if (priceRange?.min || priceRange?.max) {
      const label = `Price: RM${priceRange.min?.toLocaleString() || "0"}${priceRange.max ? `-${priceRange.max.toLocaleString()}` : "+"}`;
      tags.push({
        label,
        onRemove: () => {
          setPriceRange({});
          setPriceMin("");
          setPriceMax("");
        },
      });
    }

    if (datePreset) {
      tags.push({
        label: `Date: ${datePreset}`,
        onRemove: () => {
          setDateRange({});
          setListedAfter("");
          setListedBefore("");
          setDatePreset("");
        },
      });
    } else if (listedAfter || listedBefore) {
      const label = `Date: ${listedAfter ? `After ${listedAfter}` : ""}${listedBefore ? ` Before ${listedBefore}` : ""}`;
      tags.push({
        label,
        onRemove: () => {
          setDateRange({});
          setListedAfter("");
          setListedBefore("");
        },
      });
    }

    if (sizePreset) {
      tags.push({
        label: `Size: ${sizePreset}`,
        onRemove: () => {
          setLandSizeRange({});
          setLandSizeMin("");
          setLandSizeMax("");
          setSizePreset("");
        },
      });
    } else if (landSizeRange?.min || landSizeRange?.max) {
      const label = `Size: ${landSizeRange.min || "0"}-${landSizeRange.max || "∞"} sqft`;
      tags.push({
        label,
        onRemove: () => {
          setLandSizeRange({});
          setLandSizeMin("");
          setLandSizeMax("");
        },
      });
    }

    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  // Helper: Apply price range filter
  const applyPriceRange = () => {
    const min = priceMin ? parseInt(priceMin.replace(/,/g, "")) : undefined;
    const max = priceMax ? parseInt(priceMax.replace(/,/g, "")) : undefined;
    const range: PriceRange = {};
    if (min && !isNaN(min)) range.min = min;
    if (max && !isNaN(max)) range.max = max;
    setPriceRange(range);
  };

  // Helper: Apply date range filter
  const applyDateRange = (preset?: string) => {
    if (preset) {
      const now = new Date();
      let after: Date | undefined;

      switch (preset) {
        case "Last 7 days":
          after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "Last 30 days":
          after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "Last 90 days":
          after = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      setDateRange({ listedAfter: after });
      setDatePreset(preset);
      setListedAfter("");
      setListedBefore("");
    } else {
      const range: DateRange = {};
      if (listedAfter) range.listedAfter = new Date(listedAfter);
      if (listedBefore) range.listedBefore = new Date(listedBefore);
      setDateRange(range);
      setDatePreset("");
    }
  };

  // Helper: Apply land size range filter
  const applyLandSizeRange = (preset?: string) => {
    if (preset) {
      const range: LandSizeRange = {};

      switch (preset) {
        case "< 1000":
          range.max = 1000;
          break;
        case "1000-5000":
          range.min = 1000;
          range.max = 5000;
          break;
        case "5000-10000":
          range.min = 5000;
          range.max = 10000;
          break;
        case "> 10000":
          range.min = 10000;
          break;
      }

      setLandSizeRange(range);
      setSizePreset(preset);
      setLandSizeMin("");
      setLandSizeMax("");
    } else {
      const range: LandSizeRange = {};
      const min = landSizeMin
        ? parseInt(landSizeMin.replace(/,/g, ""))
        : undefined;
      const max = landSizeMax
        ? parseInt(landSizeMax.replace(/,/g, ""))
        : undefined;
      if (min && !isNaN(min)) range.min = min;
      if (max && !isNaN(max)) range.max = max;
      setLandSizeRange(range);
      setSizePreset("");
    }
  };

  // Helper: Clear all advanced filters
  const clearAllAdvancedFilters = () => {
    clearAdvancedFilters();
    setPriceMin("");
    setPriceMax("");
    setListedAfter("");
    setListedBefore("");
    setLandSizeMin("");
    setLandSizeMax("");
    setDatePreset("");
    setSizePreset("");
  };

  const filteredListings = listings;

  return (
    <section id="listings" className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">
              Premium Properties
            </span>
            <h2 className="font-serif text-4xl text-primary font-bold">
              Featured Listings
            </h2>
          </div>

          {/* Main Filter Tabs */}
          <div className="bg-white p-1 rounded-md shadow-sm inline-flex">
            <button
              onClick={() => setListingType(ListingType.SALE)}
              className={`px-6 py-2 rounded-sm text-sm font-bold transition-all ${
                listingType === ListingType.SALE
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setListingType(ListingType.RENT)}
              className={`px-6 py-2 rounded-sm text-sm font-bold transition-all ${
                listingType === ListingType.RENT
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              For Rent
            </button>
          </div>
        </div>

        {/* Detailed Filters */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search keywords..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm appearance-none bg-white"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as PropertyCategory | "All")
                }
              >
                <option value="All">All Categories</option>
                {Object.values(PropertyCategory).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Filter
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Location */}
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm appearance-none bg-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <MapPin
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Clear Filters - visual spacer or actual clear button if needed */}
            <button
              onClick={() => {
                setCategory("All");
                setLocation("All");
                setSearchQuery("");
              }}
              className="w-full py-2.5 border border-gray-200 rounded-sm text-sm font-medium text-gray-500 hover:border-accent hover:text-accent transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Advanced Filters</h3>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-accent hover:text-accent-hover flex items-center gap-1"
            >
              {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
              <Filter
                size={16}
                className={`transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (RM)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-28 px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-28 px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={applyPriceRange}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-sm transition-colors"
                  >
                    Apply
                  </button>
                  {(priceRange?.min || priceRange?.max) && (
                    <button
                      onClick={() => {
                        setPriceRange({});
                        setPriceMin("");
                        setPriceMax("");
                      }}
                      className="text-sm text-gray-500 hover:text-accent flex items-center gap-1"
                    >
                      <X size={14} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Date
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {["Last 7 days", "Last 30 days", "Last 90 days"].map(
                      (preset) => (
                        <button
                          key={preset}
                          onClick={() => applyDateRange(preset)}
                          className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                            datePreset === preset
                              ? "bg-accent text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {preset}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <input
                        type="date"
                        placeholder="Listed After"
                        className="px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                        value={listedAfter}
                        onChange={(e) => setListedAfter(e.target.value)}
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="date"
                        placeholder="Listed Before"
                        className="px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                        value={listedBefore}
                        onChange={(e) => setListedBefore(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => applyDateRange()}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-sm transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Land Size Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land Size (sq ft)
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {["< 1000", "1000-5000", "5000-10000", "> 10000"].map(
                      (preset) => (
                        <button
                          key={preset}
                          onClick={() => applyLandSizeRange(preset)}
                          className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                            sizePreset === preset
                              ? "bg-accent text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {preset}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-28 px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                        value={landSizeMin}
                        onChange={(e) => setLandSizeMin(e.target.value)}
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-28 px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-accent text-sm"
                        value={landSizeMax}
                        onChange={(e) => setLandSizeMax(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => applyLandSizeRange()}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-sm transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear All Advanced Filters */}
              {(priceRange || dateRange || landSizeRange) && (
                <button
                  onClick={clearAllAdvancedFilters}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear All Advanced Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilterTags.length > 0 && (
          <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>
              {activeFilterTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={tag.onRemove}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-sm rounded-sm hover:bg-accent/20 transition-colors"
                >
                  {tag.label}
                  <X size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Data Warning */}
        {usingFallbackData && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-8 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Unable to load your listings
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {fetchError?.toLowerCase().includes("index")
                  ? "Firestore index may be building. Run: firebase deploy --only firestore:indexes"
                  : "Please check your Firebase configuration."}
              </p>
              <button
                onClick={() => setTriggerRefresh((p) => p + 1)}
                className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Show skeleton cards while loading
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              <p className="text-lg">
                No listings found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setCategory("All");
                  setLocation("All");
                  setSearchQuery("");
                }}
                className="mt-4 text-accent font-medium underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

ListingsGrid.displayName = "ListingsGrid";

export default ListingsGrid;
