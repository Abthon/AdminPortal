import { KeenIcon } from "@/components";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface ILicenseInfoItem {
  label: string;
  filename: string | null;
  type?: number;
}
interface ILicenseInfoItems extends Array<ILicenseInfoItem> {}

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function capitalizeFirstLetter(input: string): string {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}

interface LicenseInfoProps {
  data: any;
  layout?: 'grid' | 'horizontal';
}

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

const LicenseInfo: React.FC<LicenseInfoProps> = ({ data, layout = 'grid' }) => {
  console.log(data, "license data");

  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // Create license items array - only include non-null values
  const items: ILicenseInfoItems = [
    {
      label: "License",
      filename: data.filename,
    },
    {
      label: "Degree Certificate:",
      filename: data.degree_certificate,
    },
    {
      label: "Government ID:",
      filename: data.government_id,
    },
    {
      label: "CV",
      filename: data.professional_license,
    },
    {
      label: "Special Training:",
      filename: data.special_training,
    },
  ].filter((item) => item.filename !== null); // Only show items that have files

  // Function to open image in modal
  const openImageModal = async (fileName: string, title: string) => {
    try {
      const fileUrl = `${BASE_URL}/${fileName}`;
      setImageUrl(fileUrl);
      setModalTitle(title);
      setShowModal(true);
    } catch (error) {
      console.error("Error opening the image:", error);
    }
  };

  // Function to handle download
  const handleDownload = async () => {
    try {
      // First try to fetch with credentials and proper headers
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*,*/*',
        },
        credentials: 'same-origin', // Include cookies if same origin
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from URL and ensure it has proper extension
      let filename = imageUrl.split("/").pop() || "document";
      if (!filename.includes('.')) {
        // If no extension, try to determine from blob type
        const extension = blob.type.split('/')[1] || 'jpg';
        filename = `${filename}.${extension}`;
      }
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download started successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      
      // Fallback: Open in new tab if fetch fails (CORS issues)
      try {
        const a = document.createElement("a");
        a.href = imageUrl;
        a.target = "_blank";
        a.download = imageUrl.split("/").pop() || "document";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.info("Download opened in new tab. Please save the file manually if needed.");
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
        toast.error("Download failed. Please try right-clicking the image and selecting 'Save image as...'");
      }
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title">Therapist Documents</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{items.length} Documents</span>
            <button className="btn btn-sm btn-icon btn-clear btn-primary">
              <KeenIcon icon="plus" />
            </button>
          </div>
        </div>
      </div>

      <div className="card-body pt-3.5 pb-3.5" style={{ overflowX: 'hidden' }}>
        {items.length > 0 ? (
          layout === 'horizontal' ? (
            // Horizontal scrollable layout for therapist detail
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
                {items.map((item, index) => {
                  if (!item.filename) return null;

                  const getDocumentType = (label: string) => {
                    switch (label) {
                      case "License":
                        return { name: "License", type: "LICENSE", year: "2025" };
                      case "Degree Certificate:":
                        return { name: "Degree Certificate", type: "DEGREE", year: "2024" };
                      case "Government ID:":
                        return { name: "Government ID", type: "ID", year: "2025" };
                      case "CV":
                        return { name: "CV", type: "CV", year: "2025" };
                      case "Special Training:":
                        return { name: "Special Training", type: "TRAINING", year: "2025" };
                      default:
                        return { name: "Document", type: "DOC", year: "2025" };
                    }
                  };

                  const docInfo = getDocumentType(item.label);

                  return (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex-shrink-0" 
                      style={{ width: '280px', overflowX:'hidden' }}
                      onClick={() => openImageModal(item.filename!, docInfo.name)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <KeenIcon icon="document" className="text-gray-600 text-xl" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {docInfo.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="uppercase font-medium">{docInfo.type}</span>
                            <span>•</span>
                            <span>{docInfo.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Grid layout for session detail
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, index) => {
                console.log(item.label, "THe label abeniiii", items.length)
                if (!item.filename) return null;

                const getDocumentType = (label: string) => {
                  switch (label) {
                    case "License":
                      return { name: "License", type: "LICENSE", year: "2025" };
                    case "Degree Certificate:":
                      return { name: "Degree Certificate", type: "DEGREE", year: "2025" };
                    case "Government ID:":
                      return { name: "Government ID", type: "ID", year: "2025" };
                    case "CV":
                      return { name: "CV", type: "CV", year: "2025" };
                    case "Special Training:":
                      return { name: "Special Training", type: "TRAINING", year: "2025" };
                    default:
                      return { name: "Document", type: "DOC", year: "2025" };
                  }
                };

                const docInfo = getDocumentType(item.label);

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <KeenIcon icon="document" className="text-gray-600 text-xl" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {docInfo.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span className="uppercase font-medium">{docInfo.type}</span>
                          <span>•</span>
                          <span>{docInfo.year}</span>
                        </div>
                        
                        <button
                          onClick={() => openImageModal(item.filename!, docInfo.name)}
                          className="w-full btn btn-xs btn-outline btn-primary"
                        >
                          <KeenIcon icon="eye" className="me-1" />
                          View Document
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <KeenIcon icon="document" className="text-4xl text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h4>
            <p className="text-gray-600">No professional documents have been uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{modalTitle}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <KeenIcon icon="cross" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              {/* Check if it's an image or PDF */}
              {imageUrl.toLowerCase().endsWith(".pdf") ? (
                <div className="w-full h-96">
                  <iframe
                    src={imageUrl}
                    className="w-full h-full border rounded"
                    title={modalTitle}
                  />
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={modalTitle}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <a
                href={imageUrl}
                download
                className="btn btn-sm btn-primary"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload();
                }}
              >
                <KeenIcon icon="folder-down" className="me-2" />
                Download
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm btn-outline btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { LicenseInfo, type ILicenseInfoItem, type ILicenseInfoItems };
