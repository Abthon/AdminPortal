import { KeenIcon } from "@/components/keenicons";
import { Contributors } from "../../default";
import {
  Activity,
  ApiCredentials,
  DriverBooking,
  DriverVehicleInfo,
  GeneralInfo,
  RecentInvoices,
  Statistics,
} from "./blocks";
import { DriverLocation } from "./blocks/DriverLocation";
import React, { useState } from "react";
import { DriverRatings } from "./blocks/DriverRating";

interface DriverProfileContentProps {
  data: any;
}

const DriverProfileContent: React.FC<DriverProfileContentProps> = ({
  data,
}) => {
  const [activeView, setActiveView] = useState<"bookings" | "ratings">(
    "bookings"
  );

  const handleShowBookings = () => {
    setActiveView("bookings");
  };

  const handleShowRatings = () => {
    setActiveView("ratings");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
      <div className="col-span-1 lg:col-span-3">
        <Statistics />
      </div>
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <GeneralInfo data={data} />
          <DriverVehicleInfo data={data.vehicle} />
          {/* <ApiCredentials /> */}
          {/* <Tags title="Skills" /> */}
        </div>
      </div>
      <div className="col-span-2">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {/* Buttons side by side */}
            <div className="flex gap-3">
              <button
                type="button"
                className={`btn btn-sm ${activeView === "bookings" ? "btn-primary" : "btn-outline btn-primary"}`}
                onClick={handleShowBookings}
              >
                <KeenIcon icon="calendar" /> Show Bookings
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeView === "ratings" ? "btn-primary" : "btn-outline btn-primary"}`}
                onClick={handleShowRatings}
              >
                <KeenIcon icon="star" /> Show Ratings
              </button>
            </div>

            {/* Conditional rendering based on active view */}
            {activeView === "bookings" && (
              <DriverBooking data={data.bookings} />
            )}

            {activeView === "ratings" && <DriverRatings data={data.ratings} />}

            <DriverLocation data={data} />
            {/* <Activity /> */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
              <Contributors />
              <RecentInvoices />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DriverProfileContent };
