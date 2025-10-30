import { timeAgo } from "@/utils/Time";
import { KeenIcon } from "@/components";
import { useEffect, useState } from "react";
import axiosInstance from "@/auth/_helpers";
//import { saveAs } from "file-saver";

interface IDriverVehicleInfoItem {
  label: string;
  info: string;
}

interface IDriverVehicleInfoItems extends Array<IDriverVehicleInfoItem> {}
interface DriverVehicleInfoProps {
  data: any;
}

const DriverVehicleInfo: React.FC<DriverVehicleInfoProps> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  useEffect(() => {
    const getVehicleType = async () => {
      if (!data) return;

      try {
        const response = await axiosInstance.get(
          `/api/v1/vehicles/${data.id}?fields=vehicleType.* `
        );
        if (response.status === 200) {
          setVehicleType(response.data.data.vehicleType.name);
        }
      } catch (error) {
        console.error("Error fetching vehicle type:", error);
      }
    };

    getVehicleType();
  }, []);

  function downloadImage(url: any, filename: any) {
    fetch(url, { mode: "cors" })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "image.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Download failed:", error));
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `vehicle-document-${Date.now()}.jpg`; // Generate filename with timestamp
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  const items: IDriverVehicleInfoItems = [
    { label: "Make:", info: data?.make },
    { label: "Model", info: data?.model },
    { label: "Plate_number:", info: data?.plate_number },
    { label: "Year", info: data?.year },
    { label: "Color", info: data?.color },
    { label: "Vehicle Type", info: vehicleType },
    {
      label: "Librae",
      info: data?.librae,
    },
    {
      label: "CreatedAt",
      info: data?.createdAt ? timeAgo(data?.createdAt) : null,
    },
  ];

  const renderItem = (item: IDriverVehicleInfoItem, index: number) => {
    const baseUrl = "https://app.navigo.et/test/static/";

    const openVehicleLibraeModal = async (fileName: any) => {
      try {
        const fileUrl = `${baseUrl}librae/${fileName}`;
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
          {item.label === "Librae" ? (
            <div>
              <button
                onClick={() => openVehicleLibraeModal(item.info)}
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
        <h3 className="card-title">Vehicle Info</h3>
      </div>

      {data ? (
        <>
          <div className="card-body pt-3.5 pb-1">
            <table className="table-auto">
              <tbody>
                {items.map((item, index) => {
                  return renderItem(item, index);
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card-body pt-3.5 flex justify-center items-center">
          <p className="text-sm text-gray-600">No data available</p>
        </div>
      )}

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Driver Librae</h3>
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
            <button onClick={handleDownload} className="btn btn-sm btn-primary">
              <KeenIcon icon="folder-down" className="me-2" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export {
  DriverVehicleInfo,
  type IDriverVehicleInfoItem,
  type IDriverVehicleInfoItems,
};
