# Import Oscar Listings to Firebase

This script imports property listings from `~/Downloads/oscarlisting/` to Firebase Firestore and Storage.

## Prerequisites

1. **Firebase Service Account**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

2. **Install ImageMagick** (for HEIC conversion, optional but recommended):
   ```bash
   # macOS
   brew install imagemagick

   # Ubuntu/Debian
   sudo apt-get install imagemagick

   # Windows
   # Download from https://imagemagick.org/script/download.php
   ```

## Setup

1. Create a `.env` file in the `scripts/` directory:
   ```bash
   cp scripts/.env.example scripts/.env
   ```

2. Add your Firebase service account JSON to the `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...",...}'
   ```

   Note: The entire JSON content should be on one line. You can use a tool like https://www.freeformatter.com/json-escape.html to convert the JSON to an escaped string.

3. Ensure your listings are in `~/Downloads/oscarlisting/` with the following structure:
   ```
   ~/Downloads/oscarlisting/
   ├── Factory/
   │   ├── Property Name 1/
   │   │   ├── IMG_*.HEIC (building photos)
   │   │   └── IMG_4179.PNG (spec sheet)
   │   └── Property Name 2/
   ├── Land/
   └── Shop Lot/
   ```

## Usage

Run the import script:
```bash
pnpm tsx scripts/import-oscar-listings.ts
```

## What It Does

1. **Scans** all property directories in `~/Downloads/oscarlisting/`
2. **Detects** category from folder names (Factory → Industrial, Land → Land, etc.)
3. **Extracts** spec data from PNG images using OCR (Tesseract.js)
4. **Uploads** building photos to Firebase Storage
5. **Creates** listing documents in Firestore with extracted data

## Script Files

- `import-oscar-listings.ts` - Main entry point
- `ocr-parser.ts` - OCR text extraction from spec images
- `spec-parser.ts` - Parse OCR text into structured data
- `image-uploader.ts` - Image processing and upload to Firebase Storage

## Notes

- HEIC images will be automatically converted to JPEG (requires ImageMagick)
- PNG files are treated as spec sheets and not included in listing images
- Duplicate listings are allowed (no deduplication)
- OCR accuracy may vary - review imported listings and correct as needed

## Troubleshooting

**HEIC conversion fails**:
- Install ImageMagick (see Prerequisites above)
- Or convert HEIC files manually before running the script

**OCR accuracy issues**:
- Ensure spec sheet images are clear and high-resolution
- Manual correction may be needed for some listings

**Firebase permissions error**:
- Verify your service account has Firestore and Storage permissions
- Check that FIREBASE_SERVICE_ACCOUNT in .env is complete and valid

**Module not found errors**:
- Run `pnpm install` to install all dependencies
