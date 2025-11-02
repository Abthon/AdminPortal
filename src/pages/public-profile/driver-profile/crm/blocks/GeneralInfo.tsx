import { KeenIcon } from "@/components";
import { CommonRating } from "@/partials/common";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import React from "react";
import { useQuery } from "react-query";
import axiosInstance from "@/auth/_helpers";
// import { saveAs } from "file-saver";

interface IGeneralInfoItem {
  label: string;
  info: string | React.ReactNode;
  type?: number;
}
interface IGeneralInfoItems extends Array<IGeneralInfoItem> {}

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function capitalizeFirstLetter(input: string): string {
  if (!input) return input; // Handle empty strings
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function truncateString(str: string) {
  if (str.length > 10) {
    return `${str.slice(0, 10)}...`;
  }
}

const removeBaseUrl = (url: any) => {
  const baseUrl = "https://app.navigo.et/test/static/profile/";
  console.log(url.replace(baseUrl, url, "here here"));
  return url.replace(baseUrl, "");
};

interface GeneralInfoProps {
  data: any;
}

const GeneralInfo: React.FC<GeneralInfoProps> = ({ data }) => {
  // Add state for modal
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `driver-document-${Date.now()}.jpg`; // Generate filename with timestamp
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Fetch average rating using useQuery
  const {
    data: ratingData,
    isLoading: isRatingLoading,
    isError: isRatingError,
  } = useQuery({
    queryKey: ["driverRating", data?.id], // Query key with driver ID
    queryFn: async () => {
      if (!data?.id) return null; // Don't fetch if ID is not available
      const response = await axiosInstance.get(
        `/api/v1/drivers/rating/${data.id}`
      );
      return response.data.data.averageRating; // Extract the averageRating
    },
    enabled: !!data?.id, // Only run the query if data.id exists
  });
  const items: IGeneralInfoItems = [
    { label: "Phone:", info: `+251 ${data.phoneNumber}`, type: 1 },
    ratingData && {
      label: "Average Rating:",
      info: isRatingLoading ? (
        "Loading..."
      ) : isRatingError ? (
        "Error"
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-md">{ratingData?.toFixed(1) || "N/A"}</span>
          <KeenIcon icon="star" />
        </div>
      ),
      type: 2,
    },
    {
      label: "Status:",
      info: `<span class="badge badge-sm ${data.status === "suspended" && "badge-danger"} ${data.status === "inactive" && "badge-warning"} ${data.status === "active" && "badge-success"} ${data.status === "pending" && "badge-primary"} badge-outline">${capitalizeFirstLetter(data.status)}</span>`,
    },
    { label: "Type:", info: capitalizeFirstLetter(data.type) },
    { label: "Gender:", info: capitalizeFirstLetter(data.gender) },
    {
      label: "Driver License:",
      info: data.drivingLicense,
    },
    { label: "Created at:", info: timeAgo(data.createdAt) },
  ].filter(Boolean); // Filter out any falsy values (like undefined or null)

  const renderItems = (item: IGeneralInfoItem, index: number) => {
    const baseUrl = "https://app.navigo.et/test/static/";

    const openDriverLicenseModal = async (fileName: any) => {
      try {
        const fileUrl = `${baseUrl}license/${fileName}`;
        setImageUrl(fileUrl);
        setShowModal(true);
      } catch (error) {
        console.error("Error opening the image:", error);
      }
    };

    return (
      <tr key={index}>
        <td className="text-sm text-gray-600 pb-3 pe-4 lg:pe-8">
          {item.label}
        </td>
        <td className="text-sm text-gray-900 pb-3">
          {item.type === 1 ? (
            <span>{item.info}</span>
          ) : item.type === 2 ? (
            <span>{item.info}</span>
          ) : item.label === "Driver License:" ? (
            <div>
              <button
                onClick={() => openDriverLicenseModal(item.info)}
                className="btn btn-sm btn-icon btn-clear btn-primary"
              >
                <KeenIcon icon="eye" />
              </button>
            </div>
          ) : (
            <span
              dangerouslySetInnerHTML={{ __html: item.info as string }}
            ></span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">General Info</h3>
      </div>

      <div className="card-body pt-3.5 pb-3.5">
        <table className="table-auto">
          <tbody>
            {items.map((item, index) => {
              return renderItems(item, index);
            })}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Driver License</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <KeenIcon icon="cross" />
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Driver License"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleDownload}
                className="btn btn-sm btn-primary"
              >
                <KeenIcon icon="folder-down" className="me-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { GeneralInfo, type IGeneralInfoItem, type IGeneralInfoItems };
