import React, { useState, useRef, useEffect } from 'react';

export interface ImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
}

export type ImageSize = 'thumbnail' | 'medium' | 'large';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  blurPlaceholder?: string;
  showSkeleton?: boolean;
  sizes?: ImageSizes;
  size?: ImageSize;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==',
  threshold = 0.1,
  blurPlaceholder,
  showSkeleton = true,
  sizes,
  size = 'medium',
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBlurLoaded, setIsBlurLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const blurRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Convert to WebP if supported
  const getOptimizedSrc = (originalSrc: string, requestedSize?: ImageSize): string => {
    // If sizes prop is provided and a specific size is requested, use that size
    if (sizes && requestedSize) {
      return sizes[requestedSize];
    }

    // In production, you would use a service like Cloudinary or Imgix
    // For now, we'll use the original src
    // You can add WebP conversion logic here
    return originalSrc;
  };

  // Generate srcset for responsive images
  const generateSrcset = (): string | undefined => {
    if (!sizes) return undefined;

    const sizeSpecs = [
      { size: 'thumbnail' as const, width: 200 },
      { size: 'medium' as const, width: 800 },
      { size: 'large' as const, width: 1200 },
    ];

    return sizeSpecs
      .map(spec => `${sizes[spec.size]} ${spec.width}w`)
      .join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizesAttr = (): string => {
    return '(max-width: 640px) 200px, (max-width: 1024px) 800px, 1200px';
  };

  // Shimmer animation for skeleton
  const shimmerStyle = `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .shimmer {
      animation: shimmer 2s infinite linear;
      background: linear-gradient(to right, #eff1f3 4%, #e2e2e2 25%, #eff1f3 36%);
      background-size: 1000px 100%;
    }
  `;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef as any}>
      <style>{shimmerStyle}</style>

      {/* Skeleton/Placeholder */}
      {!isLoaded && showSkeleton && (
        <div className="absolute inset-0 bg-gray-200 shimmer" aria-hidden="true" />
      )}

      {/* Blur placeholder */}
      {blurPlaceholder && !isLoaded && (
        <img
          ref={blurRef}
          src={blurPlaceholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-500"
          style={{ opacity: isBlurLoaded ? 1 : 0 }}
          onLoad={() => setIsBlurLoaded(true)}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={getOptimizedSrc(src, size)}
          srcSet={generateSrcset()}
          sizes={generateSizesAttr()}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${hasError ? 'hidden' : ''}`}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400 text-xs">Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
