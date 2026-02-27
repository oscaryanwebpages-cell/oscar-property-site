import React from "react";
import { Listing } from "../types";
import { memo } from "react";
import { MapPin, Maximize, ArrowUpRight } from "lucide-react";
import LazyImage from "./ui/LazyImage";
import { useStore } from "../store";
import { analytics } from "../services/analytics";

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const { openDetailModal } = useStore();

  const handleClick = () => {
    analytics.listingCardClicked(listing.id);
    openDetailModal(listing);
  };

  // Use imageUrl if available, otherwise use first image from images array
  const displayImage =
    listing.imageUrl ||
    (listing.images && listing.images.length > 0 ? listing.images[0] : "");

  return (
    <div
      className="group bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {displayImage ? (
          <LazyImage
            src={displayImage}
            alt={listing.title}
            className="transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-sm ${
              listing.type === "SALE" ? "bg-accent" : "bg-blue-600"
            }`}
          >
            For {listing.type}
          </span>
          {listing.featured && (
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-sm">
              Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-xl font-bold">
            RM {listing.price.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-2 flex items-center gap-2 text-text-muted text-xs uppercase tracking-wide font-semibold">
          <span className="text-accent">{listing.category}</span>
          <span>•</span>
          <span>{listing.tenure}</span>
        </div>
        <h3 className="font-heading font-bold text-lg text-primary mb-3 line-clamp-2 flex-1 group-hover:text-accent transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2 text-text-muted text-sm mb-4">
          <MapPin size={16} className="text-accent" />
          {listing.location}
        </div>

        <div className="border-t border-gray-100 pt-4 mt-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Maximize size={16} />
            {listing.landSize}
          </div>
          <button
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label="View details"
          >
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ListingCard, (prevProps, nextProps) => {
  // Custom comparison for optimal performance
  return (
    prevProps.listing.id === nextProps.listing.id &&
    prevProps.listing.title === nextProps.listing.title &&
    prevProps.listing.price === nextProps.listing.price &&
    prevProps.listing.imageUrl === nextProps.listing.imageUrl &&
    prevProps.listing.status === nextProps.listing.status
  );
});
