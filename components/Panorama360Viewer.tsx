import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Maximize2 } from 'lucide-react';
import LazyImage from './ui/LazyImage';
import { analytics } from '../services/analytics';

interface Panorama360ViewerProps {
  images: string[]; // Array of 360 panorama image URLs
  listingId?: string;
  className?: string;
}

const Panorama360Viewer: React.FC<Panorama360ViewerProps> = ({ images, listingId, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track 360 view on mount
  useEffect(() => {
    if (listingId && !hasTrackedView) {
      analytics.panorama360Viewed(listingId);
      setHasTrackedView(true);
    }
  }, [listingId, hasTrackedView]);

  // Calculate current image index based on drag position
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaX = e.clientX - startX;
    const containerWidth = containerRef.current.offsetWidth;
    const step = containerWidth / images.length;
    const indexChange = Math.round(deltaX / step);
    const newIndex = (currentIndex + indexChange + images.length) % images.length;
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const containerWidth = containerRef.current.offsetWidth;
    const step = containerWidth / images.length;
    const indexChange = Math.round(deltaX / step);
    const newIndex = (currentIndex + indexChange + images.length) % images.length;
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setCurrentIndex(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-sm overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      {/* 360 Image Display */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <LazyImage
          src={images[currentIndex]}
          alt={`360 View - Frame ${currentIndex + 1}`}
          className="w-full h-full object-cover select-none"
        />
        
        {/* Overlay gradient for better controls visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={resetView}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-sm text-white hover:bg-black/80 transition-colors"
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-sm text-white hover:bg-black/80 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-accent w-8' 
                  : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Instructions */}
        {!isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium pointer-events-none z-10"
          >
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-sm">
              ← Drag to rotate →
            </div>
          </motion.div>
        )}
      </div>

      {/* Frame Counter */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-sm text-white text-xs font-medium z-10">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default Panorama360Viewer;
