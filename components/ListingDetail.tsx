import React, { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Maximize,
  Phone,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Mail,
  Send,
} from "lucide-react";
import { Listing } from "../types";
import { AGENT_PROFILE, WHATSAPP_ICON_URL } from "../constants";
import MultimediaLayout from "./MultimediaLayout";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { motion } from "framer-motion";
import Modal from "./ui/Modal";
import { analytics } from "../services/analytics";
import { updateListing, deleteListing } from "../services/firebase";
import { getCurrentUser } from "../services/firebase";
import { ListingStatus } from "../types";
import { useToast } from "./ui/Toast";

interface ListingDetailProps {
  listing: Listing;
  onClose: () => void;
  onRefresh?: () => void;
}

// Global flag to ensure Google Maps loader is only called once
let mapsLoaderInitialized = false;

const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  onClose,
  onRefresh,
}) => {
  const toast = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableListing, setEditableListing] = useState<Listing>(listing);

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    interestType: "sale" as "sale" | "rent" | "info",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const user = getCurrentUser();
    // Check if user's email is in admin list
    const adminEmails = ["oscar@oscaryan.my", "oscaryanwebpages@gmail.com"];
    setIsAdmin(user ? adminEmails.includes(user.email || "") : false);
  }, []);

  // Only initialize Google Maps loader once globally
  useEffect(() => {
    if (!mapsLoaderInitialized && process.env.VITE_GOOGLE_MAPS_API_KEY) {
      // Load Google Maps script dynamically
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?v=weekly&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=maps`;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
        mapsLoaderInitialized = true;
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setIsLoaded(true); // Set to true anyway to show fallback UI
      };
      document.head.appendChild(script);
    } else if (mapsLoaderInitialized) {
      setIsLoaded(true);
    }
  }, []);

  const coordinates = listing.coordinates || { lat: 1.4927, lng: 103.7414 };
  const mapContainerStyle = { width: "100%", height: "300px" };

  // Track listing view on mount
  useEffect(() => {
    analytics.listingViewed(listing.id, listing.title);
  }, [listing.id, listing.title]);

  // Handle field changes during edit
  const handleFieldChange = (field: keyof Listing, value: any) => {
    setEditableListing({ ...editableListing, [field]: value });
  };

  // Admin action handlers
  const handleStatusChange = async (status: ListingStatus) => {
    try {
      const success = await updateListing(listing.id, { status });
      if (success) {
        analytics.trackEvent("admin_listing_status_changed", {
          listing_id: listing.id,
          status,
        });
        toast.success(`Listing status updated to ${status}`);
        onClose(); // Close modal to refresh data
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update listing status");
    }
  };

  const handleDelete = async () => {
    toast.confirm("Are you sure you want to delete this listing?", async () => {
      const success = await deleteListing(listing.id);
      if (success) {
        analytics.trackEvent("admin_listing_deleted", {
          listing_id: listing.id,
        });
        toast.success("Listing deleted");
        onClose(); // Close modal to refresh data
      }
    });
  };

  const handleSave = async () => {
    try {
      // Prepare update data - only send editable fields
      const updateData = {
        title: editableListing.title,
        price: editableListing.price,
        location: editableListing.location,
        landSize: editableListing.landSize,
        category: editableListing.category,
        tenure: editableListing.tenure,
        type: editableListing.type,
        description: editableListing.description,
        images: editableListing.images,
        imageUrl: editableListing.imageUrl,
        specifications: editableListing.specifications,
        propertyGuruUrl: editableListing.propertyGuruUrl,
        iPropertyUrl: editableListing.iPropertyUrl,
      };

      const success = await updateListing(listing.id, updateData);
      if (success) {
        analytics.trackEvent("admin_listing_updated", {
          listing_id: listing.id,
        });
        toast.success("Listing updated successfully");
        setIsEditing(false);
        onRefresh?.(); // Refresh parent listings grid
        onClose(); // Close modal to refresh data
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    }
  };

  const handleWhatsApp = () => {
    analytics.whatsappClicked(listing.id);
    const message = encodeURIComponent(
      `Hi Oscar, I'm interested in "${listing.title}". Please share more details.`,
    );
    window.open(
      `https://wa.me/${AGENT_PROFILE.phone.replace(/[^0-9]/g, "")}?text=${message}`,
      "_blank",
    );
  };

  const handlePhone = () => {
    analytics.phoneClicked();
    window.location.href = `tel:${AGENT_PROFILE.phone}`;
  };

  // Inquiry form handlers
  const validateInquiryForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!inquiryForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!inquiryForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryForm.email)) {
      errors.email = "Invalid email format";
    }

    if (!inquiryForm.message.trim()) {
      errors.message = "Message is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInquiryForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setFormSubmitting(true);
    try {
      // Track form submission
      analytics.contactFormSubmitted();
      analytics.trackEvent("inquiry_form_submitted", {
        listing_id: listing.id,
        interest_type: inquiryForm.interestType,
      });

      // In a real implementation, you would send this to your backend
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Inquiry sent successfully! Oscar will contact you soon.");

      // Clear form
      setInquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        interestType: "sale",
      });
      setFormErrors({});
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleInquiryFieldChange = (
    field: keyof typeof inquiryForm,
    value: string,
  ) => {
    setInquiryForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={isEditing ? () => setIsEditing(false) : onClose}
      size="xl"
    >
      <div className="listing-detail">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-sm ${
                  editableListing.type === "SALE" ? "bg-accent" : "bg-blue-600"
                }`}
              >
                For {editableListing.type}
              </span>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary bg-gray-100 rounded-sm">
                {editableListing.category}
              </span>
              {/* Admin Status Badge */}
              {isAdmin && !isEditing && (
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-sm ${
                    listing.status === "active"
                      ? "bg-green-600"
                      : listing.status === "sold"
                        ? "bg-gray-600"
                        : "bg-yellow-600"
                  }`}
                >
                  {listing.status || "active"}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editableListing.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="font-serif text-2xl md:text-3xl font-bold text-primary bg-gray-50 px-2 rounded-sm w-full"
                />
              ) : (
                listing.title
              )}
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-accent mb-4">
              {isEditing ? (
                <input
                  type="number"
                  value={editableListing.price}
                  onChange={(e) =>
                    handleFieldChange("price", parseFloat(e.target.value))
                  }
                  className="text-2xl md:text-3xl font-bold text-accent bg-gray-50 px-2 rounded-sm w-full"
                />
              ) : (
                `RM ${listing.price.toLocaleString()}`
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Admin Actions */}
            {isAdmin && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors text-accent"
                  title="Edit Listing"
                >
                  <Edit size={20} />
                </button>
                {listing.status !== "sold" ? (
                  <button
                    onClick={() => handleStatusChange("sold")}
                    className="p-2 hover:bg-gray-100 rounded-sm transition-colors text-gray-600"
                    title="Mark as Sold"
                  >
                    <DollarSign size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange("active")}
                    className="p-2 hover:bg-gray-100 rounded-sm transition-colors text-green-600"
                    title="Activate"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
                {listing.status === "active" ? (
                  <button
                    onClick={() => handleStatusChange("inactive")}
                    className="p-2 hover:bg-gray-100 rounded-sm transition-colors text-yellow-600"
                    title="Deactivate"
                  >
                    <XCircle size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange("active")}
                    className="p-2 hover:bg-gray-100 rounded-sm transition-colors text-green-600"
                    title="Activate"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-sm transition-colors text-red-600"
                  title="Delete Listing"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
            {isEditing && isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={isEditing ? () => setIsEditing(false) : onClose}
              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
              aria-label={isEditing ? "Cancel" : "Close"}
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Multimedia Layout */}
        <div className="mb-6">
          <MultimediaLayout listing={listing} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Key Details */}
          <div className="bg-gray-50 rounded-sm p-4">
            <h3 className="font-bold text-primary mb-4 uppercase tracking-wide text-sm">
              Key Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={18} className="text-accent" />
                <span className="text-sm">{listing.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Maximize size={18} className="text-accent" />
                <span className="text-sm">{listing.landSize}</span>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Tenure: </span>
                {listing.tenure}
                {listing.specifications?.tenureExplanation ? (
                  <span className="block text-gray-600 mt-1">
                    {listing.specifications.tenureExplanation}
                  </span>
                ) : (
                  <span className="block text-gray-600 mt-1">
                    {listing.tenure === "Freehold"
                      ? "永久产权，无到期限制"
                      : "租赁产权，有年限限制"}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Category: </span>
                {listing.category}
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-primary text-white rounded-sm p-4">
            <h3 className="font-bold mb-4 uppercase tracking-wide text-sm">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleWhatsApp}
                className="block w-full hover:opacity-90 transition-opacity"
                aria-label="WhatsApp Oscar"
              >
                <img
                  src={WHATSAPP_ICON_URL}
                  alt="WhatsApp"
                  className="h-12 w-auto mx-auto object-contain"
                />
              </button>
              <button
                onClick={handlePhone}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-sm transition-colors"
              >
                <Phone size={18} />
                {AGENT_PROFILE.phone}
              </button>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-gray-50 rounded-sm p-4">
            <h3 className="font-bold text-primary mb-4 uppercase tracking-wide text-sm">
              Send an Inquiry
            </h3>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inquiryForm.name}
                  onChange={(e) =>
                    handleInquiryFieldChange("name", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent text-sm ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your full name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inquiryForm.email}
                  onChange={(e) =>
                    handleInquiryFieldChange("email", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent text-sm ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={(e) =>
                    handleInquiryFieldChange("phone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  placeholder="+60 12-3456 7890"
                />
              </div>

              {/* Interest Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I'm interested in
                </label>
                <select
                  value={inquiryForm.interestType}
                  onChange={(e) =>
                    handleInquiryFieldChange("interestType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-white"
                >
                  <option value="sale">Purchasing (For Sale)</option>
                  <option value="rent">Renting (For Rent)</option>
                  <option value="info">More Information</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inquiryForm.message}
                  onChange={(e) =>
                    handleInquiryFieldChange("message", e.target.value)
                  }
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent text-sm ${
                    formErrors.message ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="I'm interested in this property. Please provide more details..."
                />
                {formErrors.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-primary font-bold py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Inquiry
                  </>
                )}
              </button>

              {/* Alternative Contact */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Or contact directly:
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <a
                    href={`mailto:${AGENT_PROFILE.email}`}
                    className="flex items-center gap-1 text-accent hover:text-accent-hover"
                  >
                    <Mail size={16} />
                    Email
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Property Specifications */}
        {listing.specifications &&
          Object.keys(listing.specifications).length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-primary mb-3 uppercase tracking-wide text-sm">
                Property Specifications
              </h3>
              <div className="bg-gray-50 rounded-sm p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {listing.specifications.landTitleNo && (
                    <>
                      <dt className="font-medium text-gray-600">
                        Land Title No.
                      </dt>
                      <dd className="text-gray-800">
                        {listing.specifications.landTitleNo}
                      </dd>
                    </>
                  )}
                  {listing.specifications.district && (
                    <>
                      <dt className="font-medium text-gray-600">District</dt>
                      <dd className="text-gray-800">
                        {listing.specifications.district}
                      </dd>
                    </>
                  )}
                  {listing.specifications.buildUpArea && (
                    <>
                      <dt className="font-medium text-gray-600">
                        Build-up Area
                      </dt>
                      <dd className="text-gray-800">
                        {listing.specifications.buildUpArea}
                      </dd>
                    </>
                  )}
                  {listing.specifications.ceilingHeights && (
                    <>
                      <dt className="font-medium text-gray-600">
                        Ceiling Heights
                      </dt>
                      <dd className="text-gray-800">
                        {listing.specifications.ceilingHeights}
                      </dd>
                    </>
                  )}
                  {listing.specifications.powerSupply && (
                    <>
                      <dt className="font-medium text-gray-600">
                        Power Supply
                      </dt>
                      <dd className="text-gray-800">
                        {listing.specifications.powerSupply}
                      </dd>
                    </>
                  )}
                  {listing.specifications.floorLoad && (
                    <>
                      <dt className="font-medium text-gray-600">Floor Load</dt>
                      <dd className="text-gray-800">
                        {listing.specifications.floorLoad}
                      </dd>
                    </>
                  )}
                  {listing.specifications.currentStatus && (
                    <>
                      <dt className="font-medium text-gray-600">
                        Current Status
                      </dt>
                      <dd className="text-gray-800">
                        {listing.specifications.currentStatus}
                      </dd>
                    </>
                  )}
                  {listing.specifications.viewingPIC && (
                    <>
                      <dt className="font-medium text-gray-600">Viewing PIC</dt>
                      <dd className="text-gray-800">
                        {listing.specifications.viewingPIC}
                      </dd>
                    </>
                  )}
                  {listing.specifications.googleMapLink && (
                    <>
                      <dt className="font-medium text-gray-600">Map</dt>
                      <dd>
                        <a
                          href={listing.specifications.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          View on Google Maps
                          <ExternalLink size={14} />
                        </a>
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}

        {/* Description */}
        {listing.description && (
          <div className="mb-6">
            <h3 className="font-bold text-primary mb-3 uppercase tracking-wide text-sm">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        {/* External Links */}
        {(listing.propertyGuruUrl || listing.iPropertyUrl) && (
          <div className="mb-6">
            <h3 className="font-bold text-primary mb-3 uppercase tracking-wide text-sm">
              View on Other Platforms
            </h3>
            <div className="flex flex-wrap gap-3">
              {listing.propertyGuruUrl && (
                <a
                  href={listing.propertyGuruUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-primary font-medium rounded-sm transition-colors text-sm"
                >
                  PropertyGuru
                  <ExternalLink size={16} />
                </a>
              )}
              {listing.iPropertyUrl && (
                <a
                  href={listing.iPropertyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-primary font-medium rounded-sm transition-colors text-sm"
                >
                  iProperty
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="mb-6">
          <h3 className="font-bold text-primary mb-3 uppercase tracking-wide text-sm">
            Location
          </h3>
          <div className="rounded-sm overflow-hidden border border-gray-200">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={coordinates}
                zoom={15}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                }}
              >
                <Marker position={coordinates} title={listing.title} />
              </GoogleMap>
            ) : (
              <div className="h-[300px] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Loading map...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ListingDetail;
