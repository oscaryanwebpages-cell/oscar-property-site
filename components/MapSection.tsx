import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  MarkerClustererF,
} from "@react-google-maps/api";
import type {
  ClusterIconStyle,
  ClusterIconInfo,
  MarkerExtended,
} from "@react-google-maps/marker-clusterer";
import { getListings } from "../services/firebase";
import { useStore } from "../store";
import {
  LISTINGS as FALLBACK_LISTINGS,
  LOCATION_COORDINATES,
} from "../constants";
import { motion } from "framer-motion";
import { analytics } from "../services/analytics";
import { Listing, ListingType } from "../types";
import { ChevronDown } from "lucide-react";

const MAP_MAX_PROPERTIES = 100;
const LOCATION_LIST_INITIAL = 3;

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "500px",
};

const center = {
  lat: 4.2,
  lng: 101.5,
};

// Purple circle SVG (For Sale) - base64
const purpleCircleS = btoa(
  '<svg width="52" height="52" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="26" cy="26" r="16" fill="#7C3AED"/><circle cx="26" cy="26" r="15.25" stroke="#fff" stroke-width="1.5"/></svg>',
);
const purpleCircleM = btoa(
  '<svg width="68" height="68" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="34" cy="34" r="24" fill="#7C3AED"/><circle cx="34" cy="34" r="23" stroke="#fff" stroke-width="2"/></svg>',
);
const purpleCircleL = btoa(
  '<svg width="90" height="90" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="45" cy="45" r="35" fill="#7C3AED"/><circle cx="45" cy="45" r="33.5" stroke="#fff" stroke-width="3"/></svg>',
);

// Cyan/teal circle SVG (For Rent)
const cyanCircleS = btoa(
  '<svg width="52" height="52" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="26" cy="26" r="16" fill="#0D9488"/><circle cx="26" cy="26" r="15.25" stroke="#fff" stroke-width="1.5"/></svg>',
);
const cyanCircleM = btoa(
  '<svg width="68" height="68" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="34" cy="34" r="24" fill="#0D9488"/><circle cx="34" cy="34" r="23" stroke="#fff" stroke-width="2"/></svg>',
);
const cyanCircleL = btoa(
  '<svg width="90" height="90" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="45" cy="45" r="35" fill="#0D9488"/><circle cx="45" cy="45" r="33.5" stroke="#fff" stroke-width="3"/></svg>',
);

function makeClusterStyles(
  small: string,
  medium: string,
  large: string,
): ClusterIconStyle[] {
  const base: Partial<ClusterIconStyle> = {
    textColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
    fontWeight: "700",
    fontStyle: "normal",
  };
  return [
    {
      ...base,
      url: `data:image/svg+xml;base64,${small}`,
      height: 52,
      width: 52,
      textSize: 16,
    },
    {
      ...base,
      url: `data:image/svg+xml;base64,${medium}`,
      height: 68,
      width: 68,
      textSize: 18,
    },
    {
      ...base,
      url: `data:image/svg+xml;base64,${large}`,
      height: 90,
      width: 90,
      textSize: 22,
    },
  ];
}

const purpleClusterStyles = makeClusterStyles(
  purpleCircleS,
  purpleCircleM,
  purpleCircleL,
);
const cyanClusterStyles = makeClusterStyles(
  cyanCircleS,
  cyanCircleM,
  cyanCircleL,
);

function clusterCalculator(markers: MarkerExtended[]): ClusterIconInfo {
  const n = markers.length;
  let index = 1;
  if (n >= 50) index = 3;
  else if (n >= 10) index = 2;
  return { text: `${n}`, index, title: `Cluster of ${n} markers` };
}

// Dark theme for map
const darkTheme = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

interface LocationCount {
  name: string;
  forSale: number;
  forRent: number;
}

const MapSection: React.FC = () => {
  const { openDetailModal, setLocation } = useStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForSale, setShowForSale] = useState(true);
  const [showForRent, setShowForRent] = useState(true);
  const [locationListExpanded, setLocationListExpanded] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );
  const mapRef = useRef<google.maps.Map | null>(null);
  const propertyListRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const fromFirebase = await getListings();
        if (fromFirebase.length > 0) {
          setListings(fromFirebase);
        } else {
          setListings(FALLBACK_LISTINGS);
        }
      } catch (e) {
        console.error("MapSection fetch listings:", e);
        setListings(FALLBACK_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    const forSale = listings.filter((l) => l.type === ListingType.SALE).length;
    const forRent = listings.filter((l) => l.type === ListingType.RENT).length;
    return { forSale, forRent };
  }, [listings]);

  const locationCounts: LocationCount[] = useMemo(() => {
    const byLocation: Record<string, { forSale: number; forRent: number }> = {};
    listings.forEach((l) => {
      const loc = l.location || "Other";
      if (!byLocation[loc]) byLocation[loc] = { forSale: 0, forRent: 0 };
      if (l.type === ListingType.SALE) byLocation[loc].forSale += 1;
      else byLocation[loc].forRent += 1;
    });
    const entries = Object.entries(byLocation)
      .map(([name, counts]) => ({
        name,
        forSale: counts.forSale,
        forRent: counts.forRent,
      }))
      .filter((c) => c.forSale > 0 || c.forRent > 0)
      .sort((a, b) => b.forSale + b.forRent - (a.forSale + a.forRent));
    return entries;
  }, [listings]);

  const visibleLocations = locationListExpanded
    ? locationCounts
    : locationCounts.slice(0, LOCATION_LIST_INITIAL);
  const hiddenCount = Math.max(
    0,
    locationCounts.length - LOCATION_LIST_INITIAL,
  );

  const mapListings = useMemo(() => {
    const isPenangArea = (loc: string) =>
      /penang|pinang|pulau pinang|nibong tebal|seberang perai|butterworth|george town/i.test(
        loc,
      );
    const isJohorArea = (loc: string) =>
      /johor|jb|senai|pasir gudang|medini|kempas|tebrau|kulai|skudai|mount austin|ulu tiram|bandar putra|iskandar/i.test(
        loc,
      );
    const coordsInPenang = (c: { lat: number; lng: number }) =>
      c.lat >= 4.5 && c.lat <= 6 && c.lng >= 99 && c.lng <= 101;
    const coordsInJohor = (c: { lat: number; lng: number }) =>
      c.lat >= 1 && c.lat <= 2.5 && c.lng >= 102 && c.lng <= 104;

    const getCoords = (l: Listing): { lat: number; lng: number } | null => {
      const loc = l.location?.trim() || "";
      const locLower = loc.toLowerCase();
      const getLocationFallback = (): { lat: number; lng: number } | null => {
        const searchStr = loc || l.description || "";
        if (!searchStr.trim()) return null;
        const fallback =
          LOCATION_COORDINATES[loc] ??
          LOCATION_COORDINATES[loc.replace(/\s+/g, " ")] ??
          Object.entries(LOCATION_COORDINATES).find(([k]) =>
            searchStr.toLowerCase().includes(k.toLowerCase()),
          )?.[1];
        if (fallback) return fallback;
        if (isPenangArea(searchStr)) return LOCATION_COORDINATES.Penang;
        if (isJohorArea(searchStr)) return LOCATION_COORDINATES.Other;
        return LOCATION_COORDINATES.Other;
      };

      const stored =
        l.coordinates?.lat != null && l.coordinates?.lng != null
          ? l.coordinates
          : null;

      if (!stored) return getLocationFallback();

      const locContext = [loc, l.description || ""].join(" ");
      if (locContext.trim()) {
        if (isPenangArea(locContext) && !coordsInPenang(stored)) {
          return getLocationFallback();
        }
        if (isJohorArea(locContext) && !coordsInJohor(stored)) {
          return getLocationFallback();
        }
      }
      return stored;
    };
    let filtered = listings
      .filter((l) => {
        if (l.type === ListingType.SALE && !showForSale) return false;
        if (l.type === ListingType.RENT && !showForRent) return false;
        return getCoords(l) != null;
      })
      .slice(0, MAP_MAX_PROPERTIES);
    return filtered.map((l) => ({
      listing: l,
      coords: getCoords(l)!,
    }));
  }, [listings, showForSale, showForRent]);

  const saleListings = useMemo(
    () =>
      mapListings.filter(({ listing }) => listing.type === ListingType.SALE),
    [mapListings],
  );
  const rentListings = useMemo(
    () =>
      mapListings.filter(({ listing }) => listing.type === ListingType.RENT),
    [mapListings],
  );

  const listingsByLocation = useMemo(() => {
    const map: Record<
      string,
      { listing: Listing; coords: { lat: number; lng: number } }[]
    > = {};
    mapListings.forEach(({ listing, coords }) => {
      const loc = listing.location || "Other";
      if (!map[loc]) map[loc] = [];
      map[loc].push({ listing, coords });
    });
    return map;
  }, [mapListings]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const focusMapOnListings = useCallback(
    (items: { listing: Listing; coords: { lat: number; lng: number } }[]) => {
      if (!mapRef.current || items.length === 0) return;
      const bounds = new google.maps.LatLngBounds();
      items.forEach(({ coords }) => bounds.extend(coords));
      if (bounds.isEmpty()) return;
      mapRef.current.fitBounds(bounds, {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      });
    },
    [],
  );

  const handleMarkerClick = (listing: Listing) => {
    analytics.listingCardClicked(listing.id);
    setSelectedListingId(listing.id);
    openDetailModal(listing);
    propertyListRefs.current[listing.id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const handleLocationClick = (name: string) => {
    analytics.mapRegionClicked(name);
    setLocation(name);
    setSelectedListingId(null);
    const items = listingsByLocation[name];
    if (items?.length) {
      focusMapOnListings(items);
    }
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePropertyListClick = (
    listing: Listing,
    coords: { lat: number; lng: number },
  ) => {
    if (!mapRef.current) return;
    setSelectedListingId(listing.id);
    mapRef.current.panTo(coords);
    mapRef.current.setZoom(15);
    openDetailModal(listing);
  };

  return (
    <section className="py-12 md:py-20 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-10"
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold">
            Where Oscar Operates
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left panel */}
          <div className="lg:w-[340px] shrink-0 flex flex-col gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Show Only Properties:
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowForSale((v) => !v)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                    showForSale
                      ? "bg-primary border-violet-500/50 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"
                    aria-hidden
                  />
                  {loading ? "…" : `${totals.forSale} For Sale`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForRent((v) => !v)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                    showForRent
                      ? "bg-primary border-teal-500/50 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"
                    aria-hidden
                  />
                  {loading ? "…" : `${totals.forRent} For Rent`}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">
                Location List
              </p>
              <ul className="space-y-1">
                {visibleLocations.map((loc) => (
                  <li key={loc.name}>
                    <button
                      type="button"
                      onClick={() => handleLocationClick(loc.name)}
                      className="text-left w-full py-1.5 px-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <span className="font-medium">{loc.name}</span>
                      <span className="block text-xs text-gray-400">
                        {[
                          loc.forSale && `${loc.forSale} For Sale`,
                          loc.forRent && `${loc.forRent} For Rent`,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {hiddenCount > 0 && !locationListExpanded && (
                <button
                  type="button"
                  onClick={() => setLocationListExpanded(true)}
                  className="mt-2 inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Show More ({hiddenCount})
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Property list - click to locate on map */}
            {mapListings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-300">
                    Properties on Map ({mapListings.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedListingId(null);
                      focusMapOnListings(mapListings);
                    }}
                    className="text-xs text-accent hover:text-accent/80 font-medium"
                  >
                    View All
                  </button>
                </div>
                <ul className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
                  {mapListings.map(({ listing, coords }) => {
                    const isSelected = selectedListingId === listing.id;
                    return (
                      <li key={listing.id}>
                        <button
                          type="button"
                          ref={(el) => {
                            propertyListRefs.current[listing.id] = el;
                          }}
                          onClick={() =>
                            handlePropertyListClick(listing, coords)
                          }
                          className={`text-left w-full py-2 px-3 rounded transition-colors ${
                            isSelected
                              ? "bg-accent/20 border border-accent/50"
                              : "hover:bg-white/10 border border-transparent"
                          }`}
                        >
                          <span
                            className={`block font-medium text-sm truncate ${
                              isSelected ? "text-accent" : "text-white"
                            }`}
                          >
                            {listing.title}
                          </span>
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {listing.location} ·{" "}
                            {listing.type === ListingType.SALE
                              ? "Sale"
                              : "Rent"}{" "}
                            · RM{" "}
                            {listing.price >= 1e6
                              ? `${(listing.price / 1e6).toFixed(1)}M`
                              : listing.price.toLocaleString()}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 min-w-0 rounded-lg overflow-hidden border border-white/10 bg-secondary relative flex flex-col">
            <div className="flex-1 relative" style={{ minHeight: "500px" }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={7}
                  onLoad={onMapLoad}
                  onUnmount={onMapUnmount}
                  options={{
                    styles: darkTheme,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {showForSale && saleListings.length > 0 && (
                    <MarkerClustererF
                      options={{
                        styles: purpleClusterStyles,
                        calculator: clusterCalculator,
                        minimumClusterSize: 2,
                        zoomOnClick: true,
                      }}
                    >
                      {(clusterer) =>
                        saleListings.map(({ listing, coords }) => (
                          <Marker
                            key={listing.id}
                            position={coords}
                            title={listing.title}
                            zIndex={
                              selectedListingId === listing.id ? 999 : undefined
                            }
                            onClick={() => handleMarkerClick(listing)}
                            clusterer={clusterer}
                          />
                        ))
                      }
                    </MarkerClustererF>
                  )}
                  {showForRent && rentListings.length > 0 && (
                    <MarkerClustererF
                      options={{
                        styles: cyanClusterStyles,
                        calculator: clusterCalculator,
                        minimumClusterSize: 2,
                        zoomOnClick: true,
                      }}
                    >
                      {(clusterer) =>
                        rentListings.map(({ listing, coords }) => (
                          <Marker
                            key={listing.id}
                            position={coords}
                            title={listing.title}
                            zIndex={
                              selectedListingId === listing.id ? 999 : undefined
                            }
                            onClick={() => handleMarkerClick(listing)}
                            clusterer={clusterer}
                          />
                        ))
                      }
                    </MarkerClustererF>
                  )}
                </GoogleMap>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <div className="text-center p-8 bg-primary/90 backdrop-blur-md rounded-md max-w-md border border-accent/20">
                    <h3 className="text-xl font-bold text-accent mb-2">
                      Interactive Map
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                        ? "Loading map..."
                        : "Configure VITE_GOOGLE_MAPS_API_KEY to enable the map. See GOOGLE_MAPS_SETUP.md."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 px-4 py-2 border-t border-white/10">
              Up to {MAP_MAX_PROPERTIES} properties with precise addresses are
              displayed on the map.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
