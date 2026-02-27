import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  Home,
  Save,
  X,
  Sparkles,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  Listing,
  ListingType,
  PropertyCategory,
  ListingSpecifications,
  ListingExtraction,
  ListingStatus,
} from "../../types";
import {
  getListings,
  getAllListings,
  createListingWithId,
  updateListing,
  deleteListing,
  uploadFile,
  signOutUser,
} from "../../services/firebase";
import {
  extractListingFromImage,
  extractListingFromText,
} from "../../services/geminiExtraction";
import { convertToWebP } from "../../utils/imageToWebp";
import { analytics } from "../../services/analytics";
import { useToast } from "../ui/Toast";

const AdminPanel: React.FC = () => {
  const toast = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Listing>>({});
  const [aiExtractMode, setAiExtractMode] = useState<"image" | "text">("image");
  const [aiExtractLoading, setAiExtractLoading] = useState(false);
  const [aiExtractError, setAiExtractError] = useState<string | null>(null);
  const [aiExtractText, setAiExtractText] = useState("");
  const [newListingId, setNewListingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    fileName: "",
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Use getAllListings to show all statuses (active, inactive, sold)
      const data = await getAllListings();
      setListings(data);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setEditingListing(null);
    setFormData({
      type: ListingType.SALE,
      category: PropertyCategory.COMMERCIAL,
      tenure: "Freehold",
      status: "active",
    });
    // Create the listing document first to get a real ID
    try {
      const tempListing: Omit<Listing, "id"> = {
        title: "Draft Listing",
        price: 1,
        location: "TBD",
        category: PropertyCategory.COMMERCIAL,
        type: ListingType.SALE,
        landSize: "",
        tenure: "Freehold",
        imageUrl: "",
        featured: false,
        status: "active",
        images: [],
        videoUrl: null,
        audioUrl: null,
        panorama360: [],
        description: "",
        coordinates: null,
        propertyGuruUrl: null,
        iPropertyUrl: null,
      };
      const id = await createListingWithId(tempListing);
      setNewListingId(id);
    } catch (error) {
      console.error("Error creating placeholder listing:", error);
      toast.error("Failed to initialize new listing. Please try again.");
      setIsCreating(false);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsCreating(false);
    setFormData(listing);
  };

  const handleSave = async () => {
    // Form validation
    const validationErrors: string[] = [];

    if (!formData.title || formData.title.trim() === "") {
      validationErrors.push("Title is required");
    }

    if (!formData.price || formData.price <= 0) {
      validationErrors.push("Price must be greater than 0");
    }

    if (!formData.location || formData.location.trim() === "") {
      validationErrors.push("Location is required");
    }

    if (!formData.category) {
      validationErrors.push("Category is required");
    }

    if (!formData.type) {
      validationErrors.push("Type is required");
    }

    if (validationErrors.length > 0) {
      toast.error(`Validation Errors: ${validationErrors.join(", ")}`);
      return;
    }

    try {
      if (isCreating) {
        // Update the existing placeholder listing with form data
        if (newListingId) {
          const success = await updateListing(newListingId, formData);
          if (success) {
            analytics.trackEvent("admin_listing_created", {
              listing_id: newListingId,
            });
            await loadListings();
            setIsCreating(false);
            setNewListingId(null);
            setFormData({});
            toast.success("Listing created successfully!");
          } else {
            toast.error(
              "Failed to update listing. Please check console for details.",
            );
          }
        }
      } else if (editingListing) {
        const success = await updateListing(editingListing.id, formData);
        if (success) {
          analytics.trackEvent("admin_listing_updated", {
            listing_id: editingListing.id,
          });
          await loadListings();
          setEditingListing(null);
          setFormData({});
          toast.success("Listing updated successfully!");
        } else {
          toast.error(
            "Failed to update listing. Please check console for details.",
          );
        }
      }
    } catch (error: any) {
      console.error("Error saving listing:", error);
      const errorMsg = error?.message || "Unknown error occurred";
      toast.error(
        `Error: ${errorMsg}. Please check that you are logged in and your email is authorized.`,
      );
    }
  };

  const handleDelete = async (id: string) => {
    toast.confirm("Are you sure you want to delete this listing?", async () => {
      const success = await deleteListing(id);
      if (success) {
        analytics.trackEvent("admin_listing_deleted", { listing_id: id });
        await loadListings();
        toast.success("Listing deleted successfully!");
      } else {
        toast.error("Failed to delete listing.");
      }
    });
  };

  const handleStatusChange = async (id: string, status: ListingStatus) => {
    try {
      const success = await updateListing(id, { status });
      if (success) {
        analytics.trackEvent("admin_listing_status_changed", {
          listing_id: id,
          status,
        });
        await loadListings();
        toast.success(`Listing status updated to ${status}`);
      } else {
        toast.error("Failed to update listing status");
      }
    } catch (error: any) {
      console.error("Error updating listing status:", error);
      toast.error(`Error: ${error?.message || "Failed to update status"}`);
    }
  };

  const getListingIdForUpload = () => {
    if (editingListing?.id) return editingListing.id;
    if (newListingId) return newListingId;
    throw new Error("No listing ID available for upload");
  };

  const handleFileUpload = async (
    file: File,
    field: "imageUrl" | "videoUrl" | "audioUrl",
    options?: { convertToWebp?: boolean },
  ) => {
    const listingId = getListingIdForUpload();
    let data: File | Blob = file;
    let ext = file.name.split(".").pop() || "";
    if (field === "imageUrl" && options?.convertToWebp !== false) {
      data = await convertToWebP(file);
      ext = "webp";
    }
    const path =
      field === "imageUrl"
        ? `listings/${listingId}/images/${Date.now()}.${ext}`
        : field === "videoUrl"
          ? `listings/${listingId}/videos/${Date.now()}_${file.name}`
          : `listings/${listingId}/audio/${Date.now()}_${file.name}`;
    const url = await uploadFile(data, path);
    if (url) {
      setFormData({ ...formData, [field]: url });
    }
  };

  const handleImagesUpload = async (files: FileList | File[]) => {
    const listingId = getListingIdForUpload();
    const arr = Array.from(files);
    const urls: string[] = formData.images || [];
    const failedFiles: string[] = [];

    setUploadProgress({ current: 0, total: arr.length, fileName: "" });

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      setUploadProgress({
        current: i + 1,
        total: arr.length,
        fileName: file.name,
      });
      try {
        const data = await convertToWebP(file);
        const path = `listings/${listingId}/images/${Date.now()}_${file.name.replace(/\.[^.]+$/, ".webp")}`;
        const url = await uploadFile(data, path);
        if (url) {
          urls.push(url);
        } else {
          failedFiles.push(file.name);
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        failedFiles.push(file.name);
      }
    }

    setFormData({ ...formData, images: urls });
    setUploadProgress({ current: 0, total: 0, fileName: "" });

    // Show summary of upload results
    if (failedFiles.length > 0) {
      toast.warning(
        `Upload complete: ${urls.length} successful, ${failedFiles.length} failed. Failed files: ${failedFiles.join(", ")}`,
      );
    }
  };

  const mergeExtraction = (ext: ListingExtraction) => {
    const spec: Partial<ListingSpecifications> = {
      ...formData.specifications,
      buildUpArea: ext.buildUpArea ?? formData.specifications?.buildUpArea,
      landTitleNo: ext.lotNumbers ?? formData.specifications?.landTitleNo,
      ceilingHeights:
        ext.ceilingHeights ?? formData.specifications?.ceilingHeights,
      powerSupply: ext.powerSupply ?? formData.specifications?.powerSupply,
      floorLoad: ext.floorLoad ?? formData.specifications?.floorLoad,
      currentStatus:
        ext.currentStatus ?? formData.specifications?.currentStatus,
      viewingPIC: ext.viewingPIC ?? formData.specifications?.viewingPIC,
      googleMapLink:
        ext.googleMapLink ?? formData.specifications?.googleMapLink,
      ...ext.specifications,
    };
    const descParts = [formData.description, ext.otherRemarks].filter(Boolean);
    setFormData({
      ...formData,
      title: ext.title ?? formData.title,
      location: ext.address ?? formData.location ?? ext.address,
      category: (ext.propertyType as PropertyCategory) ?? formData.category,
      tenure: ext.tenure ?? formData.tenure,
      price: ext.price ?? formData.price,
      landSize: ext.landSize ?? formData.landSize,
      description: descParts.join("\n\n"),
      specifications: spec,
    });
  };

  const handleAiExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiExtractError(null);
    setAiExtractLoading(true);
    try {
      let ext: ListingExtraction;
      if (aiExtractMode === "text") {
        if (!aiExtractText.trim()) {
          setAiExtractError("Please paste listing text");
          setAiExtractLoading(false);
          return;
        }
        ext = await extractListingFromText(aiExtractText);
      } else {
        const input = document.getElementById(
          "ai-extract-image",
        ) as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) {
          setAiExtractError("Please select an image");
          setAiExtractLoading(false);
          return;
        }
        ext = await extractListingFromImage(file);
      }
      mergeExtraction(ext);
      analytics.trackEvent("admin_ai_extract_success", { mode: aiExtractMode });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "AI extraction failed";
      const isCorsOrNetwork =
        raw.includes("CORS") ||
        raw.includes("fetch") ||
        raw.includes("Failed to fetch") ||
        raw.includes("NetworkError");
      const msg = isCorsOrNetwork
        ? "Network error. Ensure Cloud Functions are deployed: firebase deploy --only functions"
        : raw;
      setAiExtractError(msg);
      try {
        analytics.trackEvent("admin_ai_extract_error", { error: msg });
      } catch {
        // analytics may be unavailable
      }
    } finally {
      setAiExtractLoading(false);
    }
  };

  const handle360Upload = async (files: FileList | File[]) => {
    const listingId = getListingIdForUpload();
    const arr = Array.from(files);
    const urls: string[] = formData.panorama360 || [];
    for (const file of arr) {
      const path = `listings/${listingId}/360/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      if (url) urls.push(url);
    }
    setFormData({ ...formData, panorama360: urls });
  };

  const handleLogout = async () => {
    await signOutUser();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
            <p className="text-sm text-gray-600">
              Manage your property listings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
            >
              <BarChart3 size={20} />
              Dashboard
            </a>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
            >
              <Home size={20} />
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Property Listings</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm transition-colors"
          >
            <Plus size={20} />
            Add New Listing
          </button>
        </div>

        {/* Form Modal */}
        {(isCreating || editingListing) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">
                  {isCreating ? "Create New Listing" : "Edit Listing"}
                </h3>
                <button
                  onClick={async () => {
                    // If canceling new listing creation, delete the placeholder
                    if (isCreating && newListingId) {
                      try {
                        await deleteListing(newListingId);
                      } catch (error) {
                        console.error(
                          "Error deleting placeholder listing:",
                          error,
                        );
                      }
                    }
                    setIsCreating(false);
                    setEditingListing(null);
                    setFormData({});
                    setNewListingId(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* AI Extract Section */}
                <div className="border border-accent/30 rounded-sm p-4 bg-amber-50/50">
                  <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-accent" />
                    AI Extract from Fact Sheet
                  </h4>
                  <form onSubmit={handleAiExtract} className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAiExtractMode("image")}
                        className={`px-3 py-1.5 text-sm rounded-sm ${aiExtractMode === "image" ? "bg-accent text-primary" : "bg-gray-200 text-gray-700"}`}
                      >
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiExtractMode("text")}
                        className={`px-3 py-1.5 text-sm rounded-sm ${aiExtractMode === "text" ? "bg-accent text-primary" : "bg-gray-200 text-gray-700"}`}
                      >
                        Paste Text
                      </button>
                    </div>
                    {aiExtractMode === "image" ? (
                      <input
                        id="ai-extract-image"
                        type="file"
                        accept="image/*"
                        className="text-sm"
                      />
                    ) : (
                      <textarea
                        value={aiExtractText}
                        onChange={(e) => setAiExtractText(e.target.value)}
                        placeholder="Paste fact sheet or property specification text here..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={aiExtractLoading}
                      className="px-4 py-2 bg-accent hover:bg-accent/90 text-primary font-medium rounded-sm text-sm disabled:opacity-50"
                    >
                      {aiExtractLoading ? "Extracting..." : "Extract"}
                    </button>
                    {aiExtractError && (
                      <p className="text-sm text-red-600">{aiExtractError}</p>
                    )}
                  </form>
                  <p className="text-xs text-gray-500 mt-2">
                    Extracted data will pre-fill the form. Review and supplement
                    as needed.
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as PropertyCategory,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {Object.values(PropertyCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as ListingType,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value={ListingType.SALE}>For Sale</option>
                      <option value={ListingType.RENT}>For Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status || "active"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as ListingStatus,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Land Size
                    </label>
                    <input
                      type="text"
                      value={formData.landSize || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, landSize: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenure
                  </label>
                  <select
                    value={formData.tenure || "Freehold"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenure: e.target.value as "Freehold" | "Leasehold",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Freehold">Freehold</option>
                    <option value="Leasehold">Leasehold</option>
                  </select>
                </div>

                {/* File Uploads */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">
                    Media (images auto-converted to WebP except 360)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0], "imageUrl")
                        }
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Carousel Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          e.target.files?.length &&
                          handleImagesUpload(e.target.files)
                        }
                        disabled={uploadProgress.total > 0}
                        className="w-full text-sm"
                      />
                      {uploadProgress.total > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Uploading: {uploadProgress.fileName}</span>
                            <span>
                              {uploadProgress.current} / {uploadProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-sm h-2 overflow-hidden">
                            <div
                              className="bg-accent h-full transition-all duration-300"
                              style={{
                                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        360 Panorama (no WebP)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          e.target.files?.length &&
                          handle360Upload(e.target.files)
                        }
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0], "videoUrl")
                        }
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audio
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0], "audioUrl")
                        }
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Specifications (collapsible) */}
                <details className="border border-gray-200 rounded-sm">
                  <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
                    Advanced Specifications
                  </summary>
                  <div className="p-4 space-y-4 border-t border-gray-200">
                    {(
                      [
                        "landTitleNo",
                        "district",
                        "mukim",
                        "landUseCategory",
                        "buildUpArea",
                        "ceilingHeights",
                        "powerSupply",
                        "floorLoad",
                        "currentStatus",
                        "viewingPIC",
                        "googleMapLink",
                        "tenureExplanation",
                      ] as const
                    ).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <input
                          type="text"
                          value={formData.specifications?.[key] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifications: {
                                ...formData.specifications,
                                [key]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </details>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      // If canceling new listing creation, delete the placeholder
                      if (isCreating && newListingId) {
                        try {
                          await deleteListing(newListingId);
                        } catch (error) {
                          console.error(
                            "Error deleting placeholder listing:",
                            error,
                          );
                        }
                      }
                      setIsCreating(false);
                      setEditingListing(null);
                      setFormData({});
                      setNewListingId(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm transition-colors"
                  >
                    <Save size={20} />
                    Save Listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Table - horizontal scroll on small screens */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[140px]">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((listing) => {
                const status = listing.status || "active";
                return (
                  <tr
                    key={listing.id}
                    className={`group hover:bg-gray-50 ${
                      status === "sold" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {listing.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-sm ${
                          status === "active"
                            ? "bg-green-100 text-green-800"
                            : status === "sold"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {status === "active"
                          ? "Active"
                          : status === "sold"
                            ? "Sold"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-sm ${
                          listing.type === ListingType.SALE
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {listing.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RM {listing.price.toLocaleString()}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate"
                      title={listing.location}
                    >
                      {listing.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(listing)}
                          className="text-accent hover:text-accent-hover"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        {status !== "active" && (
                          <button
                            onClick={() =>
                              handleStatusChange(listing.id, "active")
                            }
                            className="text-green-600 hover:text-green-700"
                            title="Activate"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {status === "active" && (
                          <button
                            onClick={() =>
                              handleStatusChange(listing.id, "inactive")
                            }
                            className="text-yellow-600 hover:text-yellow-700"
                            title="Deactivate"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        {status !== "sold" && (
                          <button
                            onClick={() => {
                              toast.confirm(
                                "Mark this listing as SOLD?",
                                () => {
                                  handleStatusChange(listing.id, "sold");
                                },
                              );
                            }}
                            className="text-gray-600 hover:text-gray-700"
                            title="Mark as Sold"
                          >
                            <DollarSign size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
