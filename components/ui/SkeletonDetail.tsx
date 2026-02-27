import React from 'react';
import Modal from './Modal';

interface SkeletonDetailProps {
  isOpen: boolean;
}

const SkeletonDetail: React.FC<SkeletonDetailProps> = ({ isOpen }) => {
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

  if (!isOpen) return null;

  return (
    <>
      <style>{shimmerStyle}</style>
      <Modal isOpen={true} onClose={() => {}} size="xl">
        <div className="listing-detail">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-20 h-6 bg-gray-200 rounded-sm skeleton-shimmer" />
                <div className="w-20 h-6 bg-gray-200 rounded-sm skeleton-shimmer" />
              </div>
              <div className="w-3/4 h-10 bg-gray-200 rounded mb-4 skeleton-shimmer" />
              <div className="w-1/2 h-10 bg-gray-200 rounded skeleton-shimmer" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded" />
          </div>

          {/* Multimedia Layout placeholder */}
          <div className="mb-6">
            <div className="aspect-[16/9] bg-gray-200 rounded-sm skeleton-shimmer" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Key Details */}
            <div className="bg-gray-50 rounded-sm p-4">
              <div className="w-32 h-5 bg-gray-200 rounded mb-4 skeleton-shimmer" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="w-1/2 h-4 bg-gray-200 rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gray-200 rounded-sm p-4 skeleton-shimmer">
              <div className="w-24 h-5 bg-gray-300 rounded mb-4" />
              <div className="space-y-3">
                <div className="w-full h-12 bg-gray-300 rounded-sm" />
                <div className="w-full h-12 bg-gray-300 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Specifications placeholder */}
          <div className="mb-6">
            <div className="w-48 h-5 bg-gray-200 rounded mb-3 skeleton-shimmer" />
            <div className="bg-gray-50 rounded-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(8)].map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="w-32 h-4 bg-gray-200 rounded" />
                    <div className="w-40 h-4 bg-gray-200 rounded skeleton-shimmer" />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Description placeholder */}
          <div className="mb-6">
            <div className="w-32 h-5 bg-gray-200 rounded mb-3 skeleton-shimmer" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded skeleton-shimmer" />
              <div className="w-full h-4 bg-gray-200 rounded skeleton-shimmer" />
              <div className="w-3/4 h-4 bg-gray-200 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mb-6">
            <div className="w-24 h-5 bg-gray-200 rounded mb-3 skeleton-shimmer" />
            <div className="w-full h-[300px] bg-gray-200 rounded-sm skeleton-shimmer" />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SkeletonDetail;
