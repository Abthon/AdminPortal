import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { KeenIcon, Menu, MenuItem, MenuToggle } from "@/components";

import { DropdownCrud1, DropdownCrudItem1 } from "@/partials/dropdowns/general";
import { useState } from "react";

interface DriverBookingProps {
  data: any;
}

interface IDriverBookingItem {
  dropOffName: string;
  pickupName: string;
  status: string;
  estimatedTraveledDistance: number;
  actualPrice: number;
}
interface IDriverBookingItems extends Array<IDriverBookingItem> {}

const DriverBooking: React.FC<DriverBookingProps> = ({ data }) => {
  const { isRTL } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const renderItem = (item: IDriverBookingItem, index: number) => {
    return (
      <tr key={index}>
        <td className="text-start text-sm text-gray-800">{item.pickupName}</td>
        <td className="text-start text-sm text-gray-800">{item.dropOffName}</td>
        <td className=" text-sm text-gray-800">
          {item.estimatedTraveledDistance} km
        </td>

        <td>
          <div
            className={`badge badge-sm ${item.status === "completed" && "badge-success"} ${item.status === "started" && "badge-primary"} badge-outline`}
          >
            {item.status}
          </div>
        </td>
        <td className="text-sm text-gray-800 min-w-[150px]">
          {item.actualPrice} Birr
        </td>
      </tr>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Driver Bookings</h3>
      </div>
      <div className="card-table scrollable-x-auto">
        <table className="table text-end">
          <thead>
            <tr>
              <th className="text-start min-w-[100px] !text-gray-700">From</th>
              <th className="text-start min-w-[100px] !text-gray-700"> To</th>
              <th className="min-w-[100px]">Distance</th>
              <th className="min-w-[110px] !text-gray-700">Status</th>
              <th className="min-w-[120px] !text-gray-700">Actual Price</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              // data.map((book: IDriverBookingItem, index: number) => {
              //   return renderItem(book, index);
              // })
              data
                .slice(0, showAll ? data.length : 5) // Show either all or first 5
                .map((book: IDriverBookingItem, index: number) => {
                  return renderItem(book, index);
                })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted-foreground"
                  style={{ padding: "2rem 0" }}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data.length > 5 && ( // Show "Show More" button only if there are more than 5 items
        <div className="card-footer justify-center">
          <button onClick={() => setShowAll(!showAll)} className="btn btn-link">
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export { DriverBooking, type IDriverBookingItem, type IDriverBookingItems };
