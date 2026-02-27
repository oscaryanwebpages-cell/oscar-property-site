import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { analytics } from '../services/analytics';

interface VideoPlayerProps {
  videoUrl: string;
  listingId?: string;
  className?: string;
  lazy?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, listingId, className = '', lazy = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  useEffect(() => {
    if (!lazy) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: '100px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lazy]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Track video play event (only once per session)
        if (!hasTrackedPlay && listingId) {
          analytics.videoPlayed(listingId);
          setHasTrackedPlay(true);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div ref={containerRef} className={`relative bg-black rounded-sm overflow-hidden ${className}`}>
      <div className="relative aspect-video">
        {shouldLoad ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading video...</div>
          </div>
        )}

        {/* Controls Overlay - only when video loaded */}
        {shouldLoad && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto z-10">
            <button
              onClick={toggleMute}
              className="p-2 bg-black/60 backdrop-blur-sm rounded-sm text-white hover:bg-black/80 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/60 backdrop-blur-sm rounded-sm text-white hover:bg-black/80 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
          </div>

          {/* Center Play Button */}
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-accent/90 backdrop-blur-sm rounded-full text-white hover:bg-accent transition-all pointer-events-auto z-10"
              aria-label="Play"
            >
              <Play size={32} fill="currentColor" />
            </motion.button>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
            <button
              onClick={togglePlay}
              className="p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
