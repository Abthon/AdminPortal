import { KeenIcon } from "@/components";
import { CommonRating } from "@/partials/common";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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
  const baseUrl =
    "https://static.129.134.201.195.clients.your-server.de/prod/static/profile/";
  console.log(url.replace(baseUrl, url, "here here"));
  return url.replace(baseUrl, "");
};

interface GeneralInfoProps {
  data: any;
}

const GeneralInfo: React.FC<GeneralInfoProps> = ({ data }) => {
  console.log(data, "dl");
  const items: IGeneralInfoItems = [
    { label: "Phone:", info: `+251 ${data.phoneNumber}`, type: 1 },
    { label: "Rating:", info: <CommonRating rating={data.rating} />, type: 2 },
    {
      label: "Status:",
      info: `<span class="badge badge-sm ${data.status === "suspended" && "badge-danger"} ${data.status === "inactive" && "badge-warning"} ${data.status === "active" && "badge-success"} ${data.status === "pending" && "badge-primary"} badge-outline">${capitalizeFirstLetter(data.status)}</span>`,
    },
    { label: "Type:", info: capitalizeFirstLetter(data.type) },
    { label: "Gender:", info: capitalizeFirstLetter(data.gender) },
    { label: "Created at:", info: timeAgo(data.createdAt) },
    {
      label: "Driver License:",
      info: data.drivingLicense,
    },
  ];

  const renderItems = (item: IGeneralInfoItem, index: number) => {
    const baseUrl =
      "https://static.129.134.201.195.clients.your-server.de/prod/static/profile/";

    //const [fileName, setFileName] = useState("1739010042516-image_picker.jpg");
    //const fileName = data?.driverLicense;

    const downloadFile = async (fileName: any) => {
      try {
        const fileUrl = `${baseUrl}${fileName}`;
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release memory
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error downloading the file:", error);
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
                onClick={() => downloadFile(item.info)}
                className="btn btn-sm btn-icon btn-clear btn-primary"
              >
                <KeenIcon icon="folder-down" />
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
    </div>
  );
};

export { GeneralInfo, type IGeneralInfoItem, type IGeneralInfoItems };
