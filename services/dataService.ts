/**
 * Data Portability Service
 * Provides export/import functionality for listings and analytics data
 *
 * SUPPORTED FORMATS:
 * - JSON: Full data export with all fields
 * - CSV: Simplified export with basic fields (for spreadsheet compatibility)
 *
 * USE CASES:
 * - Data backup and restoration
 * - Migration to/from other systems
 * - Bulk data import from external sources
 * - Data analysis and reporting
 *
 * IMPORT VALIDATION:
 * - Schema validation for required fields
 * - Data type checking
 * - Duplicate detection
 * - Reference validation (e.g., category, type enums)
 */

import { Listing, ListingType, PropertyCategory, ListingStatus } from "../types";
import { db, createListingWithId, updateListing } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Export format options
 */
export type ExportFormat = "json" | "csv";

/**
 * Export options
 */
export interface ExportOptions {
  format?: ExportFormat;
  includeInactive?: boolean;
  includeSold?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  skipped: string[];
}

/**
 * Minimal listing data for CSV export
 */
interface MinimalListing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  type: string;
  landSize: string;
  tenure: string;
  status: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================================================
// P2 TASK 4: EXPORT FUNCTIONS
// =============================================================================

/**
 * Export listings to JSON or CSV format
 * Returns downloadable data blob
 *
 * @param options - Export options (format, filters)
 * @returns Blob containing exported data
 *
 * JSON FORMAT: Full listing objects with all fields
 * CSV FORMAT: Simplified columns for spreadsheet compatibility
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const listingsRef = collection(db, "listings");
 * let q = query(listingsRef);
 *
 * if (!options.includeInactive) {
 *   q = query(q, where("status", "==", "active"));
 * }
 *
 * const snapshot = await getDocs(q);
 * const listings = snapshot.docs.map(docToListing);
 * ```
 */
export const exportListings = async (
  options: ExportOptions = {}
): Promise<Blob> => {
  try {
    // MOCK: Return mock data for development
    await new Promise(resolve => setTimeout(resolve, 200));

    const format = options.format || "json";
    const mockListings: MinimalListing[] = [
      {
        id: "listing1",
        title: "Modern Office Space",
        price: 850000,
        location: "CBD Area",
        category: "Office",
        type: "SALE",
        landSize: "2,500 sq ft",
        tenure: "Leasehold",
        status: "active",
        imageUrl: "https://example.com/image1.jpg",
      },
      {
        id: "listing2",
        title: "Commercial Retail Space",
        price: 1200000,
        location: "Orchard Road",
        category: "Commercial",
        type: "RENT",
        landSize: "1,800 sq ft",
        tenure: "Leasehold",
        status: "active",
        imageUrl: "https://example.com/image2.jpg",
      },
    ];

    if (format === "csv") {
      const csv = convertListingsToCSV(mockListings);
      return new Blob([csv], { type: "text/csv" });
    } else {
      const json = JSON.stringify(mockListings, null, 2);
      return new Blob([json], { type: "application/json" });
    }

    // REAL IMPLEMENTATION (uncomment when ready):
    /*
    const listingsRef = collection(db, "listings");
    let q = query(listingsRef);

    // Apply filters
    if (!options.includeInactive && !options.includeSold) {
      q = query(q, where("status", "==", "active"));
    } else if (!options.includeInactive) {
      q = query(q, where("status", "in", ["active", "sold"]));
    } else if (!options.includeSold) {
      q = query(q, where("status", "!=", "sold"));
    }

    // Date range filter
    if (options.dateRange) {
      const startTimestamp = Timestamp.fromDate(options.dateRange.start);
      const endTimestamp = Timestamp.fromDate(options.dateRange.end);
      q = query(
        q,
        where("createdAt", ">=", startTimestamp),
        where("createdAt", "<=", endTimestamp)
      );
    }

    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as MinimalListing;
    });

    if (format === "csv") {
      const csv = convertListingsToCSV(listings);
      return new Blob([csv], { type: "text/csv" });
    } else {
      const json = JSON.stringify(listings, null, 2);
      return new Blob([json], { type: "application/json" });
    }
    */
  } catch (error) {
    console.error("Error exporting listings:", error);
    throw new Error("Failed to export listings");
  }
};

/**
 * Export analytics data to JSON or CSV format
 * Returns downloadable data blob
 *
 * @param options - Export options (format, date range)
 * @returns Blob containing exported analytics data
 *
 * JSON FORMAT: Full analytics objects with all fields
 * CSV FORMAT: Simplified columns for spreadsheet compatibility
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * const analyticsRef = collection(db, "analytics");
 * const q = query(analyticsRef, orderBy("timestamp", "desc"));
 * const snapshot = await getDocs(q);
 * ```
 */
export const exportAnalytics = async (
  options: ExportOptions = {}
): Promise<Blob> => {
  try {
    // MOCK: Return mock data for development
    await new Promise(resolve => setTimeout(resolve, 200));

    const format = options.format || "json";
    const mockAnalytics = [
      {
        date: "2025-02-14",
        totalViews: 1250,
        totalClicks: 342,
        totalSearches: 89,
        uniqueVisitors: 456,
      },
      {
        date: "2025-02-13",
        totalViews: 1080,
        totalClicks: 298,
        totalSearches: 76,
        uniqueVisitors: 402,
      },
    ];

    if (format === "csv") {
      const csv = convertAnalyticsToCSV(mockAnalytics);
      return new Blob([csv], { type: "text/csv" });
    } else {
      const json = JSON.stringify(mockAnalytics, null, 2);
      return new Blob([json], { type: "application/json" });
    }

    // REAL IMPLEMENTATION (uncomment when ready):
    /*
    const analyticsRef = collection(db, "analytics");
    const q = query(analyticsRef, orderBy("timestamp", "desc"));

    const snapshot = await getDocs(q);
    const analytics = snapshot.docs.map(doc => doc.data());

    if (format === "csv") {
      const csv = convertAnalyticsToCSV(analytics);
      return new Blob([csv], { type: "text/csv" });
    } else {
      const json = JSON.stringify(analytics, null, 2);
      return new Blob([json], { type: "application/json" });
    }
    */
  } catch (error) {
    console.error("Error exporting analytics:", error);
    throw new Error("Failed to export analytics");
  }
};

// =============================================================================
// P2 TASK 4: IMPORT FUNCTIONS
// =============================================================================

/**
 * Import listings from JSON or CSV data
 * Validates and creates listings in Firestore
 *
 * @param data - Import data (JSON object or CSV string)
 * @param format - Data format ("json" or "csv")
 * @param options - Import options
 * @returns Import result with success/failure counts
 *
 * VALIDATION RULES:
 * - Required fields: title, price, location, category, type
 * - Valid enum values: category, type, status, tenure
 * - Price must be positive number
 * - Duplicate IDs are skipped
 * - Invalid records are logged but don't stop import
 *
 * FIRESTORE IMPLEMENTATION:
 * ```typescript
 * for (const listing of validatedListings) {
 *   const { id, ...data } = listing;
 *   if (id) {
 *     // Update existing listing
 *     await updateListing(id, data);
 *   } else {
 *     // Create new listing
 *     await createListingWithId(data);
 *   }
 * }
 * ```
 */
export const importListings = async (
  data: string | object,
  format: "json" | "csv",
  options?: {
    skipValidation?: boolean;
    overwriteExisting?: boolean;
  }
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
    skipped: [],
  };

  try {
    // Parse data based on format
    let listings: Partial<Listing>[];

    if (format === "json") {
      if (typeof data === "string") {
        listings = JSON.parse(data);
      } else {
        listings = Array.isArray(data) ? data : [data];
      }
    } else {
      // CSV format
      if (typeof data !== "string") {
        throw new Error("CSV data must be a string");
      }
      listings = parseCSVToListings(data);
    }

    // MOCK: Validate and import listings
    await new Promise(resolve => setTimeout(resolve, 300));

    // Validate each listing
    const validatedListings: Listing[] = [];
    for (const listing of listings) {
      const validation = validateImportData(listing);

      if (!validation.valid) {
        result.failed++;
        result.errors.push(
          `Listing "${listing.title || "unknown"}": ${validation.errors.join(", ")}`
        );
        continue;
      }

      // Skip if not overwriting and listing exists
      if (!options?.overwriteExisting && listing.id) {
        // TODO: Check if listing exists in Firestore
        // const existing = await getListingById(listing.id);
        // if (existing) {
        //   result.skipped.push(listing.id);
        //   continue;
        // }
      }

      validatedListings.push(listing as Listing);
    }

    // Import validated listings
    for (const listing of validatedListings) {
      try {
        const { id, ...listingData } = listing;

        // MOCK: Simulate import
        result.imported++;

        // REAL IMPLEMENTATION (uncomment when ready):
        /*
        if (id && options?.overwriteExisting) {
          // Update existing listing
          await updateListing(id, listingData);
        } else {
          // Create new listing
          await createListingWithId(listingData as Omit<Listing, "id">);
        }
        */
      } catch (error) {
        result.failed++;
        result.errors.push(
          `Failed to import "${listing.title}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    result.success = result.failed === 0;
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error during import"
    );
    return result;
  }
};

/**
 * Validate import data structure
 * Checks required fields, data types, and enum values
 *
 * @param data - Partial listing data to validate
 * @returns Validation result with valid flag and errors array
 */
export const validateImportData = (
  data: Partial<Listing>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!data.title || data.title.trim() === "") {
    errors.push("Title is required");
  }

  if (!data.price || data.price <= 0) {
    errors.push("Price must be a positive number");
  }

  if (!data.location || data.location.trim() === "") {
    errors.push("Location is required");
  }

  if (!data.category) {
    errors.push("Category is required");
  } else {
    // Validate category enum
    const validCategories = ["Commercial", "Industrial", "Land", "Office"];
    if (!validCategories.includes(data.category)) {
      errors.push(`Invalid category: ${data.category}. Must be one of: ${validCategories.join(", ")}`);
    }
  }

  if (!data.type) {
    errors.push("Type is required");
  } else {
    // Validate type enum
    const validTypes = ["SALE", "RENT"];
    if (!validTypes.includes(data.type)) {
      errors.push(`Invalid type: ${data.type}. Must be one of: ${validTypes.join(", ")}`);
    }
  }

  // Validate tenure if provided
  if (data.tenure) {
    const validTenures = ["Freehold", "Leasehold"];
    if (!validTenures.includes(data.tenure)) {
      errors.push(`Invalid tenure: ${data.tenure}. Must be one of: ${validTenures.join(", ")}`);
    }
  }

  // Validate status if provided
  if (data.status) {
    const validStatuses = ["active", "inactive", "sold"];
    if (!validStatuses.includes(data.status)) {
      errors.push(`Invalid status: ${data.status}. Must be one of: ${validStatuses.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert listings array to CSV format
 * Helper for exportListings
 */
const convertListingsToCSV = (listings: MinimalListing[]): string => {
  if (listings.length === 0) {
    return "";
  }

  // CSV headers
  const headers = [
    "ID",
    "Title",
    "Price",
    "Location",
    "Category",
    "Type",
    "Land Size",
    "Tenure",
    "Status",
    "Image URL",
    "Created At",
    "Updated At",
  ];

  // Convert listings to CSV rows
  const rows = listings.map((listing) => [
    listing.id,
    escapeCSV(listing.title),
    listing.price.toString(),
    escapeCSV(listing.location),
    listing.category,
    listing.type,
    escapeCSV(listing.landSize),
    listing.tenure,
    listing.status,
    listing.imageUrl,
    listing.createdAt || "",
    listing.updatedAt || "",
  ]);

  // Combine headers and rows
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
};

/**
 * Convert analytics array to CSV format
 * Helper for exportAnalytics
 */
const convertAnalyticsToCSV = (analytics: any[]): string => {
  if (analytics.length === 0) {
    return "";
  }

  // CSV headers (dynamic based on first object)
  const headers = Object.keys(analytics[0]);

  // Convert analytics to CSV rows
  const rows = analytics.map((item) =>
    headers.map((header) => {
      const value = item[header];
      if (typeof value === "string") {
        return escapeCSV(value);
      }
      return value?.toString() || "";
    })
  );

  // Combine headers and rows
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
};

/**
 * Parse CSV string to listings array
 * Helper for importListings
 */
const parseCSVToListings = (csv: string): Partial<Listing>[] => {
  const lines = csv.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return [];
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const listings: Partial<Listing>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const listing: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      const key = header.toLowerCase().replace(/\s+/g, "");

      // Map CSV columns to listing fields
      if (key === "id") listing.id = value;
      else if (key === "title") listing.title = value;
      else if (key === "price") listing.price = parseFloat(value) || 0;
      else if (key === "location") listing.location = value;
      else if (key === "category") listing.category = value as PropertyCategory;
      else if (key === "type") listing.type = value as ListingType;
      else if (key === "landsize" || key === "land_size") listing.landSize = value;
      else if (key === "tenure") listing.tenure = value;
      else if (key === "status") listing.status = value as ListingStatus;
      else if (key === "imageurl" || key === "image_url") listing.imageUrl = value;
    });

    listings.push(listing);
  }

  return listings;
};

/**
 * Parse a single CSV line, handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

/**
 * Escape CSV value if it contains special characters
 */
const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Trigger download of exported data
 * Helper function to save exported blob to file
 */
export const downloadExport = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read file as text for import
 * Helper function to read uploaded file
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
