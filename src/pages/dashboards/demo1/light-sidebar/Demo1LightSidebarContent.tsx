import axiosInstance from "@/auth/_helpers";
import {
  ChannelStats,
  EarningsChart,
  EntryCallout,
  Highlights,
  TeamMeeting,
  Teams,
} from "./blocks";
import { DriverLocation } from "./blocks/DriverLocation";
import { useQuery } from "react-query";
import { KeenIcon } from "@/components";
import { DriversLocationMap } from "./blocks/DriverLocation2";
import { ChannelStats2 } from "./blocks/ChannelStats2";
import { Contributions } from "./blocks/Contributions";

interface IDriversData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  status: string;
  profilePhoto: string;
  type: string;
}

const DashboardSkeleton = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5 pb-12 animate-pulse">
      {/* ChannelStats2 Placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-7.5 h-full items-stretch">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-gray-300 rounded-md h-36"></div>
        ))}
      </div>

      {/* DriversLocationMap Placeholder */}
      <div className="bg-gray-300 rounded-md w-full h-[70vh]"></div>
    </div>
  );
};

const Demo1LightSidebarContent = () => {
  async function getDrivers() {
    console.log("new data");
    const url = `/api/v1/drivers`;
    const { data } = await axiosInstance.get(url);
    return data.data;
  }

  let { isLoading: isDriverLoading, data: DriverData } = useQuery<
    IDriversData[]
  >({
    queryKey: ["Bookings"],
    queryFn: getDrivers,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  async function fetchStats() {
    const response = await axiosInstance.get(`/api/v1/admin/sys/stats`);
    // console.log(response?.data, "response stat");
    return response.data;
  }

  const useStats = () => {
    return useQuery("stats", fetchStats);
  };

  const { data } = useStats();

  if (isDriverLoading) return <DashboardSkeleton />;

  return (
    <div className="grid gap-5 lg:gap-7.5 pb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5 h-full items-stretch">
        <ChannelStats2 data={data?.data} />
      </div>

      <DriversLocationMap data={DriverData} />
    </div>
  );
};

export { Demo1LightSidebarContent };
