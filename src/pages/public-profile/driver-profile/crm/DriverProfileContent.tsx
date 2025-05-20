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

interface DriverProfileContentProps {
  data: any;
}

import React from 'react';

const DriverProfileContent: React.FC<DriverProfileContentProps> = ({
  data,
}) => {
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
            <DriverBooking data={data.bookings} />

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
