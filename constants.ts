import { AgentProfile, Listing, ListingType, PropertyCategory } from "./types";

export const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/oscar-property-1cc52.firebasestorage.app/o/main%20page%2FImage%20(1).png?alt=media&token=ec453883-e8cc-42c0-8bd9-f52c06c41ff4";

export const WHATSAPP_ICON_URL =
  "https://firebasestorage.googleapis.com/v0/b/oscar-property-1cc52.firebasestorage.app/o/main%20page%2FImage.svg?alt=media&token=ed678968-afbd-4d98-875c-182cad15b6ba";

export const HERO_BACKGROUND_URL =
  "https://firebasestorage.googleapis.com/v0/b/oscar-property-1cc52.firebasestorage.app/o/main%20page%2F%E5%B7%A5%E4%B8%9A%E5%9B%AD%E5%8C%BA%E8%83%8C%E6%99%AF_%E9%80%82%E9%85%8D%E7%BD%91%E9%A1%B5.jpg?alt=media&token=59e982e0-4bfb-4df0-bfd7-c79998e6c7c3";

export const AGENT_PROFILE: AgentProfile = {
  name: "Oscar Yan",
  title: "Senior Real Estate Negotiator",
  agency: "New Bob Realty Sdn Bhd",
  regNo: "REN 08414",
  agencyLicense: "E (1) 0232",
  phone: "+6012-345-6789",
  email: "oscar.yan@newbob.com.my",
  photoUrl:
    "https://my1-cdn.pgimgs.com/agent/664037/APHO.183372883.R550X550.jpg",
  yearsExperience: 8,
  listingsCount: 81,
  dealsClosed: 150,
};

export const LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Premium Detached Factory @ Senai Industrial Park",
    price: 12500000,
    location: "Senai",
    category: PropertyCategory.INDUSTRIAL,
    type: ListingType.SALE,
    landSize: "2.5 Acres",
    tenure: "Freehold",
    imageUrl:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
    featured: true,
    // Package 3: Multimedia data example
    images: [
      "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565514020176-ade3f047b485?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
    ],
    panorama360: [
      "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565514020176-ade3f047b485?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "A premium detached factory located in the heart of Senai Industrial Park. This exceptional property offers modern facilities, excellent connectivity, and strategic positioning for industrial operations. Perfect for manufacturing, warehousing, or logistics companies seeking a prime location in Johor.",
    coordinates: { lat: 1.6, lng: 103.7 },
  },
  {
    id: "2",
    title: "Modern 3-Storey Shop Lot @ Austin Crest",
    price: 2800000,
    location: "Mount Austin",
    category: PropertyCategory.COMMERCIAL,
    type: ListingType.SALE,
    landSize: "1,680 sqft",
    tenure: "Freehold",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Modern 3-storey shop lot in the bustling Mount Austin area. High visibility location with excellent foot traffic. Ideal for retail, F&B, or office use. Freehold tenure ensures long-term investment security.",
    coordinates: { lat: 1.52, lng: 103.78 },
  },
  {
    id: "3",
    title: "High Visibility Showroom",
    price: 15000,
    location: "Johor Bahru City",
    category: PropertyCategory.COMMERCIAL,
    type: ListingType.RENT,
    landSize: "3,200 sqft",
    tenure: "Freehold",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Heavy Industry Land with Infrastructure",
    price: 8500000,
    location: "Pasir Gudang",
    category: PropertyCategory.LAND,
    type: ListingType.SALE,
    landSize: "5 Acres",
    tenure: "Leasehold",
    imageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "Corporate Office Tower Floor",
    price: 4500000,
    location: "Medini",
    category: PropertyCategory.OFFICE,
    type: ListingType.SALE,
    landSize: "5,000 sqft",
    tenure: "Freehold",
    imageUrl:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "Semi-D Factory with Mezzanine",
    price: 8500,
    location: "Kempas",
    category: PropertyCategory.INDUSTRIAL,
    type: ListingType.RENT,
    landSize: "8,000 sqft",
    tenure: "Freehold",
    imageUrl:
      "https://images.unsplash.com/photo-1565514020176-ade3f047b485?q=80&w=1000&auto=format&fit=crop",
  },
  // Penang Factory — Fact sheet: No.1177 Jalan Besar, Nibong Tebal, Penang
  {
    id: "penang-factory",
    title: "Industrial Factory, Nibong Tebal, Penang",
    price: 60000000,
    location: "Penang",
    category: PropertyCategory.INDUSTRIAL,
    type: ListingType.SALE,
    landSize: "10.38 Acres (452,172 sf / 42,008 sqm)",
    tenure: "Freehold",
    imageUrl:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
    featured: true,
    images: [],
    description:
      "No.1177, Jalan Besar, Datuk Keramat, 14300 Nibong Tebal, Penang. Title: GM 975, GM 454, GM 455, GM 456 & GM 1696. Land: 10.38 acres total. Build-up: 21,622 sqm (232,675 sf) — 1-storey factory 19,190 sqm, 3-storey office 1,441 sqm, 2-storey office 929 sqm, guard house, TNB substation. Ceiling: ridge 37.5ft, eave 28.3ft. Power: 800 amp. Floor load: min 2 ton/m². Industrial use, freehold. Current status: Own Use. Asking RM 60,000,000 (negotiable). Viewing by arrangement only (PIC: Jeffery Lim 016-8237138); at least 1 day advance notice. Sold as is where is. Map: https://maps.app.goo.gl/ukfZmKCTAqBNY6mN8",
    coordinates: { lat: 5.17, lng: 100.48 },
  },
];

export const LOCATIONS = [
  "All",
  "Senai",
  "Mount Austin",
  "Johor Bahru City",
  "Pasir Gudang",
  "Medini",
  "Kempas",
  "Penang",
];

/** Approximate coordinates for locations (used when listing has no coordinates) */
export const LOCATION_COORDINATES: Record<
  string,
  { lat: number; lng: number }
> = {
  Senai: { lat: 1.6, lng: 103.7 },
  "Mount Austin": { lat: 1.52, lng: 103.78 },
  "Johor Bahru City": { lat: 1.4927, lng: 103.7414 },
  "Johor Bahru": { lat: 1.4927, lng: 103.7414 },
  JB: { lat: 1.4927, lng: 103.7414 },
  "Pasir Gudang": { lat: 1.47, lng: 103.9 },
  Medini: { lat: 1.42, lng: 103.63 },
  Kempas: { lat: 1.51, lng: 103.72 },
  Penang: { lat: 5.17, lng: 100.48 },
  "Nibong Tebal": { lat: 5.17, lng: 100.48 },
  "Ulu Tiram": { lat: 1.6, lng: 103.82 },
  "Bandar Putra": { lat: 1.54, lng: 103.88 },
  "Iskandar Puteri": { lat: 1.42, lng: 103.63 },
  Tebrau: { lat: 1.53, lng: 103.8 },
  Kulai: { lat: 1.66, lng: 103.6 },
  Skudai: { lat: 1.54, lng: 103.66 },
  Other: { lat: 1.49, lng: 103.74 },
};
