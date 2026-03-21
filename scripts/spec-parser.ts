/**
 * Parsed property specification data
 */
export interface ParsedSpec {
  title?: string;
  location?: string;
  price?: number;
  type?: 'SALE' | 'RENT';
  landSize?: string;
  builtUpArea?: string;
  ceilingHeight?: string;
  eaveHeight?: string;
  landUse?: string;
  powerSupply?: string;
  tenure?: string;
  floorLoading?: string;
  description?: string;
  rawText?: string;
}

/**
 * Parse price string to number
 * Handles formats:
 * - RM 567,397.325
 * - RM25.5 mil
 * - RM 43,535,171.40
 * - Selling RM25.5 mil
 */
function parsePrice(text: string): number | undefined {
  const patterns = [
    /RM\s*[\d,]+\.?\d*\s*mil/i,      // RM25.5 mil
    /RM\s*[\d,]+\.?\d*/i,             // RM 567,397.325
    /Selling\s*RM\s*[\d,]+\.?\d*\s*mil/i, // Selling RM25.5 mil
    /Rent\s*RM\s*[\d,]+\.?\d*/i,      // Rent RM70k
    /\(RM\s*[\d,]+\.?\d*/i,           // (RM 2.50 per sq.ft.)
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let priceStr = match[0]
        .replace(/RM/i, '')
        .replace(/Selling|Rent|\(|\)/gi, '')
        .replace(/,/g, '')
        .trim();

      // Handle "mil" = million
      if (priceStr.toLowerCase().includes('mil')) {
        const num = parseFloat(priceStr.replace(/mil/i, ''));
        return num * 1_000_000;
      }

      // Handle "k" = thousand
      if (priceStr.toLowerCase().includes('k')) {
        const num = parseFloat(priceStr.replace(/k/i, ''));
        return num * 1_000;
      }

      const num = parseFloat(priceStr);
      if (!isNaN(num)) return num;
    }
  }

  return undefined;
}

/**
 * Detect listing type (SALE or RENT)
 */
function detectListingType(text: string): 'SALE' | 'RENT' | undefined {
  const lowerText = text.toLowerCase();

  if (/for\s*rent|rent\s*rm|to\s*let/i.test(text)) {
    return 'RENT';
  }
  if (/for\s*sale|selling\s*rm/i.test(text)) {
    return 'SALE';
  }

  return undefined;
}

/**
 * Parse land size from text
 * Formats: "Land Size: 408,157 sqft", "Land area: 130,680 sq ft"
 */
function parseLandSize(text: string): string | undefined {
  const patterns = [
    /Land\s*(?:Size|Area):\s*([\d,]+(?:\.\d+)?)\s*(?:sqft|sq\s*ft|sq\.ft\.|acres)/i,
    /Land\s*:\s*([\d,]+(?:\.\d+)?)\s*(?:sqft|sq\s*ft|acres)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse built-up area from text
 */
function parseBuiltUpArea(text: string): string | undefined {
  const patterns = [
    /(?:Total\s*)?Built\s*-?\s*(?:Up|up)\s*(?:Area|):\s*([\d,]+(?:\.\d+)?)\s*(?:sqft|sq\s*ft)/i,
    /Build\s*-?\s*up\s*area:\s*([\d,]+(?:\.\d+)?)\s*(?:sqft|sq\s*ft)/i,
    /Built-up:\s*([\d,]+(?:\.\d+)?)\s*(?:sqft|sq\s*ft)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse ceiling height from text
 */
function parseCeilingHeight(text: string): string | undefined {
  const patterns = [
    /Ceiling\s*(?:Height|):\s*([\d.]+)\s*(?:m|meter|ft|feet)/i,
    /Ceiling\s*height:\s*([\d.]+)\s*m/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse eave height from text
 */
function parseEaveHeight(text: string): string | undefined {
  const patterns = [
    /Eave\s*height:\s*([\d.]+)\s*(?:m|meter)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse land use/category from text
 */
function parseLandUse(text: string): string | undefined {
  const patterns = [
    /Land\s*Use:\s*(.+?)(?:\n|$)/i,
    /Land\s*Use\s*Category:\s*(.+?)(?:\n|$)/i,
    /Medium\s*Industry/i,
    /Light\s*Industry/i,
    /Heavy\s*Industry/i,
    /Industrial/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse power supply from text
 */
function parsePowerSupply(text: string): string | undefined {
  const patterns = [
    /Power\s*(?:Supply|):\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:AMP|amp|A)/i,
    /TNB.*?(\d+(?:,\d+)?)\s*amp/i,
    /(?:current|incoming)\s*power\s*(?:supply|):\s*(\d+(?:,\d+)?(?:\.\d+)?)\s*amp/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse tenure from text
 */
function parseTenure(text: string): string | undefined {
  const patterns = [
    /Tenure:\s*(\w+)/i,
    /Freehold/i,
    /Leasehold/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse floor loading from text
 */
function parseFloorLoading(text: string): string | undefined {
  const patterns = [
    /Floor\s*(?:Loading|Load):\s*(.+?)(?:\n|$)/i,
    /(\d+)\s*(?:kN\/m²|tons\/sqm|kg\/sqm)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Parse location from text
 * Looks for patterns like "at Seelong main road" or "Location: Senai Idaman, Johor"
 */
function parseLocation(text: string): string | undefined {
  const patterns = [
    /Location:\s*(.+?)(?:\n|$|\(|🔹)/i,
    /at\s+([A-Z][a-zA-Z\s]+?)(?:\n|Land|Built|Ceiling|\*|\(|🔹)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+–\s+Detached/i, // "Kulai – Detached Factory"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Parse property title from text
 */
function parseTitle(text: string): string | undefined {
  const patterns = [
    /^(.+?)\s+at\s+/m, // "Single Storey Detached Factory annexed 2 Storey Office at"
    /^(.+?)\n/, // First line
    /🏭\s+(.+?)\n/, // Emoji format
    /For\s+(?:Sale|Rent)\|?\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim()
        .replace(/^[\*\s]+|[\*\s]+$/g, '') // Remove surrounding * and spaces
        .replace(/\*/g, ''); // Remove all asterisks
      if (title.length > 5) return title;
    }
  }

  return undefined;
}

/**
 * Main parser function - extract all spec data from OCR text
 */
export function parseSpecText(ocrText: string): ParsedSpec {
  const text = ocrText.trim();

  return {
    title: parseTitle(text),
    location: parseLocation(text),
    price: parsePrice(text),
    type: detectListingType(text),
    landSize: parseLandSize(text),
    builtUpArea: parseBuiltUpArea(text),
    ceilingHeight: parseCeilingHeight(text),
    eaveHeight: parseEaveHeight(text),
    landUse: parseLandUse(text),
    powerSupply: parsePowerSupply(text),
    tenure: parseTenure(text),
    floorLoading: parseFloorLoading(text),
    rawText: text,
  };
}

/**
 * Generate description from parsed spec
 */
export function generateDescription(spec: ParsedSpec): string {
  const parts: string[] = [];

  if (spec.title) parts.push(spec.title);
  if (spec.location) parts.push(`Location: ${spec.location}`);
  if (spec.landSize) parts.push(spec.landSize);
  if (spec.builtUpArea) parts.push(spec.builtUpArea);
  if (spec.ceilingHeight) parts.push(spec.ceilingHeight);
  if (spec.eaveHeight) parts.push(spec.eaveHeight);
  if (spec.landUse) parts.push(spec.landUse);
  if (spec.powerSupply) parts.push(spec.powerSupply);
  if (spec.tenure) parts.push(`Tenure: ${spec.tenure}`);

  return parts.join('. ') + '.';
}
