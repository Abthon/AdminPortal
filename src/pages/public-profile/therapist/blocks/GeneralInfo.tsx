import { KeenIcon } from "@/components";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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
}

const BASE_URL = import.meta.env.VITE_APP_STATIC_URL;

const LicenseInfo: React.FC<LicenseInfoProps> = ({ data }) => {
  console.log(data, "license data");

  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  // Create license items array - only include non-null values
  const items: ILicenseInfoItems = [
    {
      label: "Professional License:",
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
      label: "Work Experience:",
      filename: data.work_experience,
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
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from URL
      const filename = imageUrl.split("/").pop() || "document";
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderItems = (item: ILicenseInfoItem, index: number) => {
    if (!item.filename) return null;

    const getDocumentType = (label: string) => {
      switch (label) {
        case "Professional License:":
          return "Professional License";
        case "Degree Certificate:":
          return "Degree Certificate";
        case "Government ID:":
          return "Government ID";
        case "Work Experience:":
          return "Work Experience Document";
        case "Special Training:":
          return "Special Training Certificate";
        default:
          return "Document";
      }
    };

    return (
      <tr key={index}>
        <td className="text-sm text-gray-600 pb-3 pe-4 lg:pe-8">
          {item.label}
        </td>
        <td className="text-sm text-gray-900 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                openImageModal(item.filename!, getDocumentType(item.label))
              }
              className="btn btn-sm btn-icon btn-clear btn-primary"
              title={`View ${getDocumentType(item.label)}`}
            >
              <KeenIcon icon="eye" />
            </button>
            {/* <span className="text-xs text-gray-500">
              {item.filename.split("/").pop()}
            </span> */}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3 className="card-title">Professional Documents</h3>
      </div>

      <div className="card-body pt-3.5 pb-3.5">
        {items.length > 0 ? (
          <table className="table-auto w-full">
            <tbody>
              {items.map((item, index) => renderItems(item, index))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4">
            <KeenIcon icon="document" className="text-3xl text-gray-400 mb-2" />
            <p className="text-gray-600">No professional documents available</p>
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
