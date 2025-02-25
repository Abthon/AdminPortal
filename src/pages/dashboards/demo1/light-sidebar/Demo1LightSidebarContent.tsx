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
    const url = `/api/v1/drivers`;
    const { data } = await axiosInstance.get(url);
    return data.data;
  }

  let { isLoading: isDriverLoading, data: DriverData } = useQuery<
    IDriversData[]
  >({
    queryKey: ["Bookings"],
    queryFn: getDrivers,
  });

  async function fetchStats() {
    const response = await axiosInstance.get(`/api/v1/admin/sys/stats`);
    console.log(response?.data, "response stat");
    return response.data;
  }

  const useStats = () => {
    return useQuery("stats", fetchStats);
  };

  const { data } = useStats();

  if (isDriverLoading) return <DashboardSkeleton />;

  return (
    <div className="grid gap-5 lg:gap-7.5 pb-12">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-7.5 h-full items-stretch">
        <ChannelStats2 data={data?.data} />
      </div>

      <DriversLocationMap data={DriverData} />
    </div>
  );
};

export { Demo1LightSidebarContent };

{
  /* <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <Highlights limit={4} />
        </div>

        <div className="lg:col-span-2">
          <Contributions title="booking" />
        </div>
      </div> */
}

{
  /* <div className="grid gap-2">
        <div className="grid grid-cols-2 h-full items-stretch">
          <div>
          </div>

          <div>
            <Highlights limit={3} />
            <Contributions title="booking" />
          </div>
        </div>
      </div> */
}

{
  /* <div className="grid lg:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
            <ChannelStats2 />
          </div>
        </div>

        <div className="lg:col-span-2">
         
          <DriversLocationMap data={DriverData} />
        </div>
      </div> */
}

{
  /* <ChannelStats2 /> */
}

{
  /* <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <TeamMeeting />
        </div>

        <div className="lg:col-span-2">
          <Teams />
        </div>
      </div> */
}
