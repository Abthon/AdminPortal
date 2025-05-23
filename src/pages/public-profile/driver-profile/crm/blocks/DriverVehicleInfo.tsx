import { timeAgo } from "@/utils/Time";
import { Link } from "react-router-dom";

interface IDriverVehicleInfoItem {
  label: string;
  info: string;
}
interface IDriverVehicleInfoItems extends Array<IDriverVehicleInfoItem> {}

interface DriverVehicleInfoProps {
  data: any;
}

//const DriverVehicleInfo = () => {
const DriverVehicleInfo: React.FC<DriverVehicleInfoProps> = ({ data }) => {
  console.log(data, "DriverVehicleInfo data");
  const items: IDriverVehicleInfoItems = [
    { label: "make:", info: data?.make },
    { label: "model", info: data?.model },
    { label: "owner:", info: data?.owner },
    { label: "plate_number:", info: data?.plate_number },
    { label: "year", info: data?.year },
    {
      label: "createdAt",
      info: data?.createdAt ? timeAgo(data?.createdAt) : null,
    },
  ];

  const renderItem = (item: IDriverVehicleInfoItem, index: number) => {
    return (
      <tr key={index}>
        <td className="text-sm text-gray-600 pb-3.5 pe-4 lg:pe-6">
          {item.label}
        </td>
        <td className="text-sm text-gray-900 pb-3">{item.info}</td>
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
    </div>
  );
};

export {
  DriverVehicleInfo,
  type IDriverVehicleInfoItem,
  type IDriverVehicleInfoItems,
};
