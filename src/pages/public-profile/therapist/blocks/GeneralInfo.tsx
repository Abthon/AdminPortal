import { KeenIcon } from "@/components";
import { CommonRating } from "@/partials/common";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface IGeneralInfoItem {
  label: string;
  profile: string | React.ReactNode;
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
  const baseUrl =
    "https://static.129.134.201.195.clients.your-server.de/prod/static/profile/";
  console.log(url.replace(baseUrl, url, "here here"));
  return url.replace(baseUrl, "");
};

interface GeneralInfoProps {
  data: any;
}

import React from "react";
const GeneralInfo: React.FC<GeneralInfoProps> = ({ data }) => {
  console.log(data, "dl");
  // Add state for modal
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const items: IGeneralInfoItems = [
    // { label: "Phone:", info: `+251 ${data.phoneNumber}`, type: 1 },
    // { label: "Rating:", info: <CommonRating rating={data.rating} />, type: 2 },
    // {
    //   label: "Status:",
    //   info: `<span class="badge badge-sm ${data.status === "suspended" && "badge-danger"} ${data.status === "inactive" && "badge-warning"} ${data.status === "active" && "badge-success"} ${data.status === "pending" && "badge-primary"} badge-outline">${capitalizeFirstLetter(data.status)}</span>`,
    // },
    // { label: "Type:", info: capitalizeFirstLetter(data.type) },
    // { label: "Gender:", info: capitalizeFirstLetter(data.gender) },
    // { label: "Created at:", info: timeAgo(data.createdAt) },
    {
      label: "Profile:",
      profile: data.profile,
    },
  ];

  const renderItems = (item: IGeneralInfoItem, index: number) => {
    const baseUrl = "https://app.navigo.et/dev/static/";
    //console.log(`baseUrl: ${baseUrl}${fileName}`);
    // const baseUrl =
    //   "https://static.129.134.201.195.clients.your-server.de/prod/static//license/";

    // Function to open image in modal
    const openImageModal = async (fileName: any) => {
      try {
        const fileUrl = `${baseUrl}${fileName}`;
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
            <span>{item.profile}</span>
          ) : item.type === 2 ? (
            <span>{item.profile}</span>
          ) : item.label === "Profile:" ? (
            <div>
              <button
                onClick={() => openImageModal(item.profile)}
                className="btn btn-sm btn-icon btn-clear btn-primary"
              >
                <KeenIcon icon="eye" />
              </button>
            </div>
          ) : (
            <span
              dangerouslySetInnerHTML={{ __html: item.profile as string }}
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
              <h3 className="text-lg font-semibold">Profile</h3>
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
                alt="Profile"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="flex justify-center mt-4">
              <a
                href={imageUrl}
                download
                className="btn btn-sm btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <KeenIcon icon="folder-down" className="me-2" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { GeneralInfo, type IGeneralInfoItem, type IGeneralInfoItems };
