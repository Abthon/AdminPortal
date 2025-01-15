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

// const obj = {
//   id: 25,
//   createdAt: "2024-12-30T02:48:28.000Z",
//   firstName: "Jhon",
//   middleName: null,
//   lastName: "Doee",
//   phoneNumber: "911094668",
//   isPhoneNumberAuthenticated: false,
//   type: "payroll",
//   drivingLicense: "abc123",
//   gender: "male",
//   is_online: false,
//   is_available: false,
//   isBusy: false,
//   lat: null,
//   lng: null,
//   averageRating: 0,
//   status: "pending",
//   profilePhoto: "1735526907796-photo_2023-10-28_09-45-14.jpg",
//   firebaseToken: "string",
//   vehicle: null,
//   bookings: [],
// };

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

  return (
    <div>
      <div className="grid lg:grid-cols-1 gap-5 lg:gap-7.5 items-stretch">
        <DriversLocationMap data={DriverData} />
        <div className="lg:col-span-1">
          <ChannelStats/>          
        </div>
      </div>

      {/* <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <TeamMeeting />
        </div>

        <div className="lg:col-span-2">
          <Teams />
        </div>
      </div> */}
    </div>
  );
};

export { Demo1LightSidebarContent };
