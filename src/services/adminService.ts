import { Timestamp } from 'firebase/firestore';
import {
  createListing,
  updateListing,
  deleteListing,
  markListingStatus,
} from './listingsService';
import {
  uploadListingImage,
  uploadListingVideo,
  uploadListingAudio,
  upload360Panorama,
  uploadAgentPhoto,
  deleteFile,
  deleteListingFiles,
  UploadResult,
  ProgressCallback,
} from './storageService';
import { updateAgentProfile, incrementListingsCount, decrementListingsCount } from './agentService';
import { FirestoreListing } from '../types/firestore';
import { PropertyCategory, ListingType } from '../types';

// Create listing with images upload
export const createListingWithMedia = async (
  data: {
    title: string;
    price: number;
    location: string;
    category: PropertyCategory;
    type: ListingType;
    landSize: string;
    tenure: 'Freehold' | 'Leasehold';
    description: string;
    featured?: boolean;
    coordinates?: { lat: number; lng: number };
    propertyGuruUrl?: string;
    iPropertyUrl?: string;
  },
  media: {
    images?: File[];
    video?: File;
    audio?: File;
    panoramas?: File[];
  },
  onProgress?: ProgressCallback
): Promise<string> => {
  const uploadedUrls: {
    images: string[];
    video: string | null;
    audio: string | null;
    panoramas: string[];
  } = {
    images: [],
    video: null,
    audio: null,
    panoramas: [],
  };

  // Create listing first to get ID
  const listingId = await createListing({
    ...data,
    imageUrl: '', // Temporary, will update after upload
    images: [],
    videoUrl: null,
    audioUrl: null,
    panorama360: [],
    featured: data.featured || false,
    status: 'active',
  });

  try {
    // Upload images
    if (media.images && media.images.length > 0) {
      for (let i = 0; i < media.images.length; i++) {
        const result = await uploadListingImage(listingId, media.images[i], (p) => {
          if (onProgress) {
            const overallProgress = (i + p / 100) / ((media.images?.length || 0) + 3) * 100;
            onProgress(overallProgress);
          }
        });
        uploadedUrls.images.push(result.url);
      }
    }

    // Upload video
    if (media.video) {
      const result = await uploadListingVideo(listingId, media.video, onProgress);
      uploadedUrls.video = result.url;
    }

    // Upload audio
    if (media.audio) {
      const result = await uploadListingAudio(listingId, media.audio, onProgress);
      uploadedUrls.audio = result.url;
    }

    // Upload 360 panoramas
    if (media.panoramas && media.panoramas.length > 0) {
      for (const panorama of media.panoramas) {
        const result = await upload360Panorama(listingId, panorama, onProgress);
        uploadedUrls.panoramas.push(result.url);
      }
    }

    // Update listing with media URLs
    await updateListing(listingId, {
      imageUrl: uploadedUrls.images[0] || '',
      images: uploadedUrls.images,
      videoUrl: uploadedUrls.video,
      audioUrl: uploadedUrls.audio,
      panorama360: uploadedUrls.panoramas,
    });

    // Increment listings count
    await incrementListingsCount();

    return listingId;
  } catch (error) {
    // Clean up uploaded files on error
    await deleteListingFiles(
      listingId,
      uploadedUrls.images,
      uploadedUrls.video || undefined,
      uploadedUrls.audio || undefined,
      uploadedUrls.panoramas
    );
    // Delete the listing document
    await deleteListing(listingId);
    throw error;
  }
};

// Update listing with new media
export const updateListingWithMedia = async (
  listingId: string,
  data: Partial<{
    title: string;
    price: number;
    location: string;
    category: PropertyCategory;
    type: ListingType;
    landSize: string;
    tenure: 'Freehold' | 'Leasehold';
    description: string;
    featured: boolean;
    coordinates: { lat: number; lng: number };
    propertyGuruUrl: string;
    iPropertyUrl: string;
  }>,
  newMedia?: {
    images?: File[];
    video?: File;
    audio?: File;
    panoramas?: File[];
  },
  mediaToDelete?: {
    imageUrls?: string[];
    videoUrl?: string;
    audioUrl?: string;
    panoramaUrls?: string[];
  },
  onProgress?: ProgressCallback
): Promise<void> => {
  // Delete old media if specified
  if (mediaToDelete) {
    const deletePromises: Promise<void>[] = [];

    if (mediaToDelete.imageUrls) {
      for (const url of mediaToDelete.imageUrls) {
        deletePromises.push(deleteFile(url));
      }
    }
    if (mediaToDelete.videoUrl) {
      deletePromises.push(deleteFile(mediaToDelete.videoUrl));
    }
    if (mediaToDelete.audioUrl) {
      deletePromises.push(deleteFile(mediaToDelete.audioUrl));
    }
    if (mediaToDelete.panoramaUrls) {
      for (const url of mediaToDelete.panoramaUrls) {
        deletePromises.push(deleteFile(url));
      }
    }

    await Promise.allSettled(deletePromises);
  }

  // Upload new media
  const newUrls: {
    images: string[];
    video: string | null;
    audio: string | null;
    panoramas: string[];
  } = {
    images: [],
    video: null,
    audio: null,
    panoramas: [],
  };

  if (newMedia) {
    if (newMedia.images) {
      for (const file of newMedia.images) {
        const result = await uploadListingImage(listingId, file, onProgress);
        newUrls.images.push(result.url);
      }
    }
    if (newMedia.video) {
      const result = await uploadListingVideo(listingId, newMedia.video, onProgress);
      newUrls.video = result.url;
    }
    if (newMedia.audio) {
      const result = await uploadListingAudio(listingId, newMedia.audio, onProgress);
      newUrls.audio = result.url;
    }
    if (newMedia.panoramas) {
      for (const file of newMedia.panoramas) {
        const result = await upload360Panorama(listingId, file, onProgress);
        newUrls.panoramas.push(result.url);
      }
    }
  }

  // Update listing
  await updateListing(listingId, {
    ...data,
    ...(newUrls.images.length > 0 && { images: newUrls.images }),
    ...(newUrls.video && { videoUrl: newUrls.video }),
    ...(newUrls.audio && { audioUrl: newUrls.audio }),
    ...(newUrls.panoramas.length > 0 && { panorama360: newUrls.panoramas }),
  });
};

// Delete listing with all media
export const deleteListingWithMedia = async (
  listingId: string,
  imageUrls: string[],
  videoUrl?: string,
  audioUrl?: string,
  panoramaUrls?: string[]
): Promise<void> => {
  // Delete all media files
  await deleteListingFiles(listingId, imageUrls, videoUrl, audioUrl, panoramaUrls);

  // Delete listing document
  await deleteListing(listingId);

  // Decrement listings count
  await decrementListingsCount();
};

// Mark listing as sold/rented with deal tracking
export const markListingAsSoldOrRented = async (
  listingId: string,
  status: 'sold' | 'rented'
): Promise<void> => {
  await markListingStatus(listingId, status);

  // Optionally increment deals closed
  // await incrementDealsClosed();
};

// Update agent profile with new photo
export const updateAgentProfileWithPhoto = async (
  data: Parameters<typeof updateAgentProfile>[0],
  photoFile?: File,
  oldPhotoUrl?: string,
  onProgress?: ProgressCallback
): Promise<void> => {
  // Upload new photo if provided
  let newPhotoUrl: string | undefined;
  if (photoFile) {
    const result = await uploadAgentPhoto(photoFile, onProgress);
    newPhotoUrl = result.url;
  }

  // Update profile
  await updateAgentProfile({
    ...data,
    ...(newPhotoUrl && { photoUrl: newPhotoUrl }),
  });

  // Delete old photo if replaced
  if (oldPhotoUrl && newPhotoUrl) {
    await deleteFile(oldPhotoUrl).catch(console.error);
  }
};
