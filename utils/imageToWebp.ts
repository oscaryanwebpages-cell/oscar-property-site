/**
 * Convert image file to WebP format using Canvas API (client-side).
 * Used for regular listing images; 360 panorama images should NOT be converted.
 * @param file - Image file (JPEG, PNG, etc.)
 * @param quality - WebP quality 0-1, default 0.85
 * @returns Promise<Blob> - WebP blob, or original file if conversion fails
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    return file;
  }
  // Skip if already WebP
  if (file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
