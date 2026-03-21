import Tesseract from 'tesseract.js';
import { readFile } from 'fs/promises';
import { extname } from 'path';

/**
 * Extract text from an image file using Tesseract.js OCR
 * @param imagePath Full path to the image file
 * @returns Extracted text content
 */
export async function extractTextFromImage(imagePath: string): Promise<string> {
  try {
    // Read image file
    const imageBuffer = await readFile(imagePath);

    // Perform OCR using Tesseract.js
    const worker = await Tesseract.createWorker('eng'); // English language
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    return text.trim();
  } catch (error) {
    throw new Error(`OCR extraction failed for ${imagePath}: ${error}`);
  }
}

/**
 * Extract text from an image with Malay language support
 * @param imagePath Full path to the image file
 * @returns Extracted text content
 */
export async function extractTextFromImageWithMalay(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await readFile(imagePath);

    // Use both English and Malay for better accuracy on Malaysian documents
    const worker = await Tesseract.createWorker('eng+msa');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    return text.trim();
  } catch (error) {
    // Fallback to English only if Malay fails
    console.warn(`Malay OCR failed, falling back to English: ${error}`);
    return extractTextFromImage(imagePath);
  }
}

/**
 * Check if a file is an image suitable for OCR
 */
export function isImageFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif'].includes(ext);
}

/**
 * Detect spec sheet image in a directory
 * Spec sheets are typically PNG files with names like:
 * - IMG_4179.PNG
 * - IMG_*17*.PNG
 * - Contains "spec", "fact", "sheet", "detail" in name
 */
export function detectSpecImage(images: string[]): string | null {
  // First, look for PNG files (spec sheets are usually PNG)
  const pngFiles = images.filter(f => f.toLowerCase().endsWith('.png'));

  // Look for common spec sheet patterns
  const specPatterns = [
    /spec/i,
    /fact/i,
    /sheet/i,
    /detail/i,
    /17\./,  // IMG_4179 pattern
    /_17/,
  ];

  for (const pattern of specPatterns) {
    const match = pngFiles.find(f => pattern.test(f));
    if (match) return match;
  }

  // If no pattern match, return the first PNG if it exists
  return pngFiles[0] || null;
}
