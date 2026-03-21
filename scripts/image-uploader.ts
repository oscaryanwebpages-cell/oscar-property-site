import sharp from 'sharp';
import { readFile, readdir, unlink, writeFile } from 'fs/promises';
import { extname, basename, join } from 'path';
import { tmpdir } from 'os';
import admin from 'firebase-admin';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);
const randomBytesAsync = promisify(randomBytes);

// Get storage bucket from initialized admin app
// Note: The admin app should be initialized in the main script
let bucket: admin.storage.Bucket | null = null;

export function setStorageBucket(storageBucket: admin.storage.Bucket) {
  bucket = storageBucket;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

/**
 * Check if a file is a HEIC image
 */
export function isHeicFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

/**
 * Check if a file is a spec sheet image (PNG)
 * Spec sheets should not be included in the main images array
 */
export function isSpecImage(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();

  // PNG files are typically spec sheets
  if (!lowerName.endsWith('.png')) return false;

  // Common spec sheet patterns
  const specPatterns = [
    /spec/, /fact/, /sheet/, /detail/,
    /17\./, /_17/, /4179/,
  ];

  return specPatterns.some(p => p.test(lowerName));
}

/**
 * Convert HEIC image to JPEG buffer
 */
export async function convertHeicToJpeg(heicPath: string): Promise<Buffer> {
  try {
    // For now, we'll need to use a different approach since sharp doesn't support HEIC directly
    // You would typically use heic-convert or magick-convert
    // For simplicity, we'll throw an error suggesting manual conversion or use ImageMagick

    throw new Error(
      'HEIC conversion requires ImageMagick or manual conversion. ' +
      'Please convert HEIC files to JPEG manually or install ImageMagick.'
    );
  } catch (error) {
    throw new Error(`Failed to convert HEIC: ${error}`);
  }
}

/**
 * Convert HEIC to JPEG using ImageMagick
 * Uses temp file to avoid buffer size issues
 */
export async function convertHeicWithImageMagick(heicPath: string): Promise<Buffer> {
  // Create a temporary file path for the output
  const tempDir = tmpdir();
  const randomSuffix = (await randomBytesAsync(8)).toString('hex');
  const tempJpgPath = join(tempDir, `convert-${randomSuffix}.jpg`);

  try {
    // Use ImageMagick to convert HEIC to JPEG file
    await execAsync(`magick "${heicPath}" "${tempJpgPath}"`);

    // Read the converted JPEG file
    const jpegBuffer = await readFile(tempJpgPath);

    // Clean up temp file
    await unlink(tempJpgPath).catch(() => {});

    return jpegBuffer;
  } catch (error) {
    // Clean up temp file on error
    await unlink(tempJpgPath).catch(() => {});
    throw new Error(`ImageMagick conversion failed: ${error}`);
  }
}

/**
 * Process and optimize an image for web
 */
export async function processImage(imageBuffer: Buffer, maxWidth = 1920): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

/**
 * Generate unique filename
 */
function generateFileName(originalName: string, listingId: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = extname(originalName) === '.heic' ? '.jpg' : extname(originalName);
  return `${listingId}-${timestamp}-${randomStr}${ext}`;
}

/**
 * Upload a single file to Firebase Storage using Admin SDK
 */
export async function uploadImageToStorage(
  fileBuffer: Buffer,
  fileName: string,
  listingId: string
): Promise<UploadResult> {
  if (!bucket) {
    throw new Error('Storage bucket not initialized. Call setStorageBucket() first.');
  }

  const path = `listings/${listingId}/${fileName}`;
  const file = bucket.file(path);

  await file.save(fileBuffer, {
    contentType: 'image/jpeg',
    public: true, // Make file publicly accessible
  });

  // Get the public URL
  const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

  return {
    url,
    path,
    fileName,
  };
}

/**
 * Process and upload all images from a directory
 * @param directoryPath Path to the directory containing images
 * @param listingId The listing ID for storage organization
 * @param skipSpecImages Whether to skip PNG spec sheet images (default: true)
 * @returns Array of upload results
 */
export async function uploadDirectoryImages(
  directoryPath: string,
  listingId: string,
  skipSpecImages: boolean = true
): Promise<UploadResult[]> {
  const files = await readdir(directoryPath);
  const imageFiles = files.filter(f =>
    /\.(heic|heif|jpg|jpeg|png|gif|webp)$/i.test(f)
  );

  const uploadResults: UploadResult[] = [];

  for (const fileName of imageFiles) {
    const filePath = join(directoryPath, fileName);

    // Skip spec sheet images if requested
    if (skipSpecImages && isSpecImage(fileName)) {
      console.log(`Skipping spec sheet: ${fileName}`);
      continue;
    }

    try {
      let imageBuffer = await readFile(filePath);

      // Convert HEIC to JPEG
      if (isHeicFile(filePath)) {
        console.log(`Converting HEIC: ${fileName}`);
        imageBuffer = await convertHeicWithImageMagick(filePath);
      }

      // Process and optimize image
      const processedBuffer = await processImage(imageBuffer);

      // Generate filename and upload
      const destFileName = generateFileName(fileName, listingId);
      const result = await uploadImageToStorage(processedBuffer, destFileName, listingId);

      uploadResults.push(result);
      console.log(`Uploaded: ${fileName} -> ${result.url}`);
    } catch (error) {
      console.error(`Failed to process ${fileName}:`, error);
      // Continue with other files
    }
  }

  return uploadResults;
}

/**
 * Get spec sheet image path from directory
 */
export async function getSpecImagePath(directoryPath: string): Promise<string | null> {
  const files = await readdir(directoryPath);
  const specImage = files.find(f => isSpecImage(f));

  if (specImage) {
    return join(directoryPath, specImage);
  }

  return null;
}
