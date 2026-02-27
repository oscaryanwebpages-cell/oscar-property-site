import React from 'react';

const SkeletonCard: React.FC = () => {
  const shimmerStyle = `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .skeleton-shimmer {
      animation: shimmer 2s infinite linear;
      background: linear-gradient(to right, #f0f0f0 4%, #e0e0e0 25%, #f0f0f0 36%);
      background-size: 1000px 100%;
    }
  `;

  return (
    <>
      <style>{shimmerStyle}</style>
      <div className="bg-white rounded-sm overflow-hidden shadow-sm border border-gray-100 flex flex-col">
        {/* Image placeholder */}
        <div className="relative aspect-[4/3 overflow-hidden bg-gray-200 skeleton-shimmer">
          {/* Badges placeholder */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="w-16 h-6 bg-gray-300 rounded-sm" />
            <div className="w-16 h-6 bg-gray-300 rounded-sm" />
          </div>
          {/* Price placeholder */}
          <div className="absolute bottom-4 left-4 w-32 h-6 bg-gray-300 rounded-sm" />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category/Tenure placeholder */}
          <div className="mb-2 flex items-center gap-2">
            <div className="w-20 h-4 bg-gray-200 rounded skeleton-shimmer" />
            <div className="w-1 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded skeleton-shimmer" />
          </div>

          {/* Title placeholder */}
          <div className="mb-3">
            <div className="w-full h-6 bg-gray-200 rounded mb-2 skeleton-shimmer" />
            <div className="w-3/4 h-6 bg-gray-200 rounded skeleton-shimmer" />
          </div>

          {/* Location placeholder */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="w-1/2 h-4 bg-gray-200 rounded skeleton-shimmer" />
          </div>

          {/* Border and footer */}
          <div className="border-t border-gray-100 pt-4 mt-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded skeleton-shimmer" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SkeletonCard;
