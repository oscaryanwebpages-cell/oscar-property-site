import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
  StorageReference,
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { STORAGE_PATHS } from '../types/firestore';

// Upload progress callback type
export type ProgressCallback = (progress: number) => void;

// Upload result type
export interface UploadResult {
  url: string;
  path: string;
}

// Generate unique filename
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  return `${timestamp}-${randomStr}.${extension}`;
};

// Upload file with progress tracking
const uploadFile = async (
  file: File,
  path: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const fileName = generateFileName(file.name);
  const fullPath = `${path}/${fileName}`;
  const storageRef = ref(storage, fullPath);

  if (onProgress) {
    // Use resumable upload for progress tracking
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, path: fullPath });
        }
      );
    });
  } else {
    // Simple upload without progress
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, path: fullPath };
  }
};

// Upload listing image
export const uploadListingImage = async (
  listingId: string,
  file: File,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = STORAGE_PATHS.LISTING_IMAGES(listingId);
  return uploadFile(file, path, onProgress);
};

// Upload listing video
export const uploadListingVideo = async (
  listingId: string,
  file: File,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = STORAGE_PATHS.LISTING_VIDEOS(listingId);
  return uploadFile(file, path, onProgress);
};

// Upload listing audio
export const uploadListingAudio = async (
  listingId: string,
  file: File,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = STORAGE_PATHS.LISTING_AUDIO(listingId);
  return uploadFile(file, path, onProgress);
};

// Upload 360 panorama image
export const upload360Panorama = async (
  listingId: string,
  file: File,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = STORAGE_PATHS.LISTING_360(listingId);
  return uploadFile(file, path, onProgress);
};

// Upload agent profile photo
export const uploadAgentPhoto = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = STORAGE_PATHS.AGENT_PROFILE;
  return uploadFile(file, path, onProgress);
};

// Delete file by URL
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract path from URL
    const decodedUrl = decodeURIComponent(url);
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?alt=media');
    const path = decodedUrl.substring(startIndex, endIndex);

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Delete file by path
export const deleteFileByPath = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// Delete all files for a listing
export const deleteListingFiles = async (
  listingId: string,
  imageUrls: string[],
  videoUrl?: string,
  audioUrl?: string,
  panoramaUrls?: string[]
): Promise<void> => {
  const deletePromises: Promise<void>[] = [];

  // Delete images
  for (const url of imageUrls) {
    deletePromises.push(deleteFile(url));
  }

  // Delete video
  if (videoUrl) {
    deletePromises.push(deleteFile(videoUrl));
  }

  // Delete audio
  if (audioUrl) {
    deletePromises.push(deleteFile(audioUrl));
  }

  // Delete 360 panoramas
  if (panoramaUrls) {
    for (const url of panoramaUrls) {
      deletePromises.push(deleteFile(url));
    }
  }

  await Promise.allSettled(deletePromises);
};

// Upload multiple images
export const uploadMultipleImages = async (
  listingId: string,
  files: File[],
  onProgress?: ProgressCallback
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const result = await uploadListingImage(listingId, files[i], (fileProgress) => {
      if (onProgress) {
        const overallProgress = ((i + fileProgress / 100) / totalFiles) * 100;
        onProgress(overallProgress);
      }
    });
    results.push(result);
  }

  return results;
};

// Get file extension from URL
export const getFileExtension = (url: string): string => {
  const decodedUrl = decodeURIComponent(url);
  const fileName = decodedUrl.split('/').pop() || '';
  return fileName.split('.').pop() || '';
};

// Check if URL is a video
export const isVideoUrl = (url: string): boolean => {
  const extension = getFileExtension(url).toLowerCase();
  return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension);
};

// Check if URL is an audio
export const isAudioUrl = (url: string): boolean => {
  const extension = getFileExtension(url).toLowerCase();
  return ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(extension);
};

// Check if URL is an image
export const isImageUrl = (url: string): boolean => {
  const extension = getFileExtension(url).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
};
