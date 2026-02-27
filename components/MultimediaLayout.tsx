import React from 'react';
import { Listing } from '../types';
import Panorama360Viewer from './Panorama360Viewer';
import ImageCarousel from './ImageCarousel';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

interface MultimediaLayoutProps {
  listing: Listing;
  className?: string;
}

/**
 * 智能多媒体布局引擎
 * 优先级逻辑: video > 360 > carousel
 * 
 * 布局规则:
 * 1. 如果有视频 -> 显示视频播放器（占据左侧主要区域）
 * 2. 如果有 360 全景图 -> 显示 360 查看器（占据左侧主要区域，如果没有视频）
 * 3. 如果有图片数组 -> 显示图片轮播（始终存在，占据左侧主要区域如果没有其他媒体）
 * 4. 如果有音频 -> 显示音频播放器（位于右侧多媒体列表）
 * 
 * 动态布局:
 * - 如果有视频/360 -> 左侧主要区域显示视频/360，右侧显示多媒体列表（音频）
 * - 如果只有图片 -> 图片轮播占据全宽
 * - 如果只有音频 -> 音频播放器占据全宽
 */
const MultimediaLayout: React.FC<MultimediaLayoutProps> = ({ listing, className = '' }) => {
  const hasVideo = !!listing.videoUrl;
  const has360 = !!listing.panorama360 && listing.panorama360.length > 0;
  const hasImages = !!listing.images && listing.images.length > 0;
  const hasAudio = !!listing.audioUrl;
  const hasCarousel = hasImages || listing.imageUrl; // Fallback to single imageUrl if no images array

  // Determine layout mode
  const hasPrimaryMedia = hasVideo || has360;
  const hasSecondaryMedia = hasAudio;

  // Get images for carousel (use images array or fallback to single imageUrl)
  const carouselImages = hasImages && listing.images 
    ? listing.images 
    : listing.imageUrl 
      ? [listing.imageUrl] 
      : [];

  return (
    <div className={`multimedia-layout ${className}`}>
      {hasPrimaryMedia || hasCarousel ? (
        <div className={`grid gap-4 ${hasPrimaryMedia && hasSecondaryMedia ? 'lg:grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>
          {/* Primary Media Area (Left) */}
          <div className="primary-media-area">
            {hasVideo ? (
              <VideoPlayer videoUrl={listing.videoUrl!} listingId={listing.id} />
            ) : has360 ? (
              <Panorama360Viewer images={listing.panorama360!} listingId={listing.id} />
            ) : hasCarousel ? (
              <ImageCarousel images={carouselImages} />
            ) : null}
          </div>

          {/* Secondary Media Area (Right) - Only show if primary media exists */}
          {hasPrimaryMedia && hasSecondaryMedia && (
            <div className="secondary-media-area space-y-4">
              {hasAudio && (
                <div className="bg-white rounded-sm p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                    Audio Narration
                  </h3>
                  <AudioPlayer audioUrl={listing.audioUrl!} listingId={listing.id} />
                </div>
              )}
            </div>
          )}
        </div>
      ) : hasAudio ? (
        // Only audio, no visual media
        <div className="bg-white rounded-sm p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-primary mb-4">Property Audio Narration</h3>
          <AudioPlayer audioUrl={listing.audioUrl!} />
        </div>
      ) : (
        // Fallback: Show single image if available
        listing.imageUrl && (
          <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden bg-gray-100">
            <img 
              src={listing.imageUrl} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
        )
      )}
    </div>
  );
};

export default MultimediaLayout;
