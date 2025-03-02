import { useState } from "react";
import {
  About,
  CommunityBadges,
  Connections,
  Contributions,
  DriverDeliveryChart,
  DeliveryStatus,
  Projects,
  RecentUploads,
  Tags,
  UnlockPartnerships,
  WorkExperience,
  Statistics,
  Highlights,
  Pie,
  DriversInfo,
  Coorporate,
} from "./blocks";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { NumOfDelivery } from "./blocks/NumOfDelivery";
import { DeliveriesChart } from "./blocks/DeliveriesChart";

type User = {
  id: number;
  firstName: string;
  lastName: string;
};

type DriverStat = {
  id: number;
  averageDeliveryTime: number;
};

// const transformDriverData = (driverData: any[]): DriverStat[] => {
//   return driverData.map(({ id, data }) => ({
//     id,
//     averageDeliveryTime: data?.data?.averageDeliveryTime ?? 0, // Default to 0 if undefined
//   }));
// };

// const transformDriverData2 = (driverData: any[]): DriverStat[] => {
//   return driverData.map(({ id, data }) => ({
//     id,
//     averageDeliveryTime: data?.data?.completedBookings ?? 0, // Default to 0 if undefined
//   }));
// };
// const transformDriverData3 = (driverData: any[]): DriverStat[] => {
//   return driverData.map(({ id, data }) => ({
//     id,
//     averageDeliveryTime: data?.data?.totalDistanceTravelled ?? 0, // Default to 0 if undefined
//   }));
// };

// const fetchDriverStats = async (userIds: number[]) => {
//   const url = `/api/v1/drivers/me/stats?startDate=2024-01-01&endDate=2025-02-13`;
//   const driverData = await Promise.all(
//     userIds.map(async (id) => {
//       try {
//         const { data } = await axiosInstance.post(url, { driverId: id });
//         console.log("data", data?.data);
//         return { id, data }; // Store id and response data
//       } catch (error) {
//         console.error(`Error fetching data for driverId ${id}:`, error);
//         return { id, data: null }; // Handle errors gracefully
//       }
//     })
//   );

//   return driverData; // Array of responses
// };

const getDeposit = async () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US");
  console.log(formattedDate, "date");

  const url = `/api/v1/deposit/stats?startDate=2024-02-01&endDate=${formattedDate}`;
  try {
    const { data } = await axiosInstance.get(url);
    console.log("data data", data.data);
    return data?.data;
  } catch (error) {
    console.error("Error fetching deposit data:", error);
    return null;
  }
};

async function fetchStats() {
  const response = await axiosInstance.get(`/api/v1/admin/sys/stats`);
  console.log(response?.data, "response stat");
  return response.data.data;
}

// const extractUserIds = (users: User[]): number[] => {
//   return users.map((user) => user.id);
// };

const ReportContent = () => {
  const { isLoading: isDriverLoading, data: stats } = useQuery({
    queryKey: ["Drivers"],
    queryFn: fetchStats,
  });

  const { isLoading: isDepositLoading, data: depositData } = useQuery({
    queryKey: ["Deposit"],
    queryFn: getDeposit,
  });

  const items: any = [
    { number: depositData?.approvedDeposits, label: "Total Revenue" },
    // { number: "369M", label: "Revenue" },
    // { number: "27", label: "Company Rank" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <Statistics items={items} />

          <Highlights data={stats} />

          <Pie title="Corporates" info={stats} />

          {/* <DriversInfo stats={stats} /> */}
          {/* <Tags title="Skills" />

          <RecentUploads title="Recent Uploads" /> */}
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            <DeliveriesChart />
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
            <Connections title="Contributors" />

            <Contributions title="Assistance" />
          </div> */}

          {/* <Projects /> */}
          <Coorporate />
        </div>
      </div>
      <div className="lg:col-span-3">
        <DriversInfo stats={stats} />
      </div>
    </div>
    // <div className="grid grid-cols-4 gap-5 lg:gap-7.5">
    //   {/* First div: Takes full width (spans all 4 columns) */}
    //   <div className="col-span-4">
    //     <Statistics items={items} />
    //   </div>

    //   {/* Second div: Takes 25% width */}
    //   <div className="col-span-1">
    //     <Highlights data={stats} />
    //   </div>

    //   {/* Third div: Takes 75% width */}
    //   <div className="col-span-3">
    //     <DriversInfo stats={stats} />
    //   </div>

    //   {/* Fourth div: 25% width */}
    //   <div className="col-span-1">
    //     <Pie title="Coor" info={stats} />
    //   </div>

    //   {/* Fifth div: 75% width */}
    //   <div className="col-span-3">
    //     <Pie title="Coor" info={stats} />
    //   </div>
    // </div>

    //   </div>

    //   <div className="col-span-1">
    //     <div className="flex flex-col gap-5 lg:gap-7.5">
    //       <div className="flex flex-col gap-5 lg:gap-7.5">
    //         <UnlockPartnerships />

    //         <DeliveryStatus />
    //       </div>

    //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
    //         <Connections title="Contributors" />

    //         <Contributions title="Assistance" />
    //       </div>

    //       <Projects />
    //     </div>
    //   </div>
    // </div>
  );
};

export { ReportContent };
