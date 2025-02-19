import { useState } from "react";
import {
  About,
  CommunityBadges,
  Connections,
  Contributions,
  DriverDeliveryChart,
  MediaUploads,
  Projects,
  RecentUploads,
  Tags,
  UnlockPartnerships,
  WorkExperience,
} from "./blocks";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { NumOfDelivery } from "./blocks/NumOfDelivery";

type User = {
  id: number;
  firstName: string;
  lastName: string;
};

type DriverStat = {
  id: number;
  averageDeliveryTime: number;
};

const transformDriverData = (driverData: any[]): DriverStat[] => {
  return driverData.map(({ id, data }) => ({
    id,
    averageDeliveryTime: data?.data?.averageDeliveryTime ?? 0, // Default to 0 if undefined
  }));
};

const transformDriverData2 = (driverData: any[]): DriverStat[] => {
  return driverData.map(({ id, data }) => ({
    id,
    averageDeliveryTime: data?.data?.completedBookings ?? 0, // Default to 0 if undefined
  }));
};

const fetchDriverStats = async (userIds: number[]) => {
  const url = `/api/v1/drivers/me/stats?startDate=2024-01-01&endDate=2025-02-13`;
  const driverData = await Promise.all(
    userIds.map(async (id) => {
      try {
        const { data } = await axiosInstance.post(url, { driverId: id });
        console.log("data", data?.data);
        return { id, data }; // Store id and response data
      } catch (error) {
        console.error(`Error fetching data for driverId ${id}:`, error);
        return { id, data: null }; // Handle errors gracefully
      }
    })
  );

  return driverData; // Array of responses
};

const extractUserIds = (users: User[]): number[] => {
  return users.map((user) => user.id);
};

const ReportContent = () => {
  const [avgDeliveries, setAvgDeliveres] = useState<any>([]);
  const [numDeliveries, setNumDeliveres] = useState<any>([]);
  async function getDrivers() {
    const url = `/api/v1/drivers?fields=id,firstName,lastName`;
    const { data } = await axiosInstance.get(url);
    const userIds = extractUserIds(data.data);
    //  console.log(userIds, "userIds");
    // const url2 = `/api/v1/drivers/me/stats?startDate=2024-01-01&endDate=2025-02-13`;
    const driverData2 = await fetchDriverStats(userIds);
    const transformedData_2 = transformDriverData2(driverData2);
    setNumDeliveres(transformedData_2);
    const transformedData = transformDriverData(driverData2);
    console.log(transformedData, "there we land");
    setAvgDeliveres(transformedData);
    console.log(data, "chart");
    return data;
  }

  const { isLoading: isDriverLoading, data: DriverData } = useQuery({
    queryKey: ["Drivers"],
    queryFn: getDrivers,
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <MediaUploads />
          <NumOfDelivery
            avgDeliveries={numDeliveries}
            DriverData={DriverData}
            DriverLoading={isDriverLoading}
          />
          {/* <CommunityBadges title="Community Badges" />
          <About />
          <WorkExperience />
          <Tags title="Skills" />
          <RecentUploads title="Recent Uploads" /> */}
        </div>
      </div>

      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          {/* <UnlockPartnerships /> */}
          <DriverDeliveryChart
            avgDeliveries={avgDeliveries}
            DriverData={DriverData}
            DriverLoading={isDriverLoading}
          />

          {/* <WorkExperience />
          <Tags title="Skills" />
          <RecentUploads title="Recent Uploads" /> */}
        </div>
      </div>
    </div>

    //   </div>

    //   <div className="col-span-1">
    //     <div className="flex flex-col gap-5 lg:gap-7.5">
    //       <div className="flex flex-col gap-5 lg:gap-7.5">
    //         <UnlockPartnerships />

    //         <MediaUploads />
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
