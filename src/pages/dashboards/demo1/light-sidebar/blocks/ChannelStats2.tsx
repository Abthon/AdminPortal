import { Fragment, useEffect } from "react";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";

interface IChannelStatsItem {
  logo: string;
  logoDark?: string;
  info: string;
  desc: string;
  path: string;
  color: string;
}
interface IChannelStatsItems extends Array<IChannelStatsItem> {}

const ChannelStats2 = ({ data }: { data: any }) => {
  useEffect(()=> {
    console.log(data, "the data");
  })
  const items: IChannelStatsItems = [
    {
      logo: "profile-circle",
      info: data?.totalDrivers,
      desc: "Total Drivers",
      path: "",
      color: "red",
    },
    {
      logo: "note-2",
      info: data?.totalBooking,
      desc: "Total Bookings",
      path: "",
      color: "primary",
    },
    {
      logo: "note-2",
      info: data?.totalRequestedBookings,
      desc: "Total Pending Bookings",
      path: "",
      color: "primary",
    },
    {
      logo: "car",
      info: data?.totalVehicles,
      desc: "Total Vehicles",
      path: "",
      color: "red",
    },
    {
      logo: "user",
      logoDark: "tiktok-dark.svg",
      info: data?.totalCorporates,
      desc: "Total Corporates",
      path: "",
      color: "red",
    },
  ];

  const renderItem = (item: IChannelStatsItem, index: number) => {
    return (
      <div
        key={index}
        className="card flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg"
      >
        <KeenIcon
          icon={item.logo}
          className=" text-blue-600 text-[1.75rem] mt-4 ms-5"
        />

        <div className="flex flex-col gap-1 pb-4 px-5">
          <span className="text-3xl font-semibold text-gray-900">
            {item.info}
          </span>
          <span className="text-2sm font-normal text-gray-700">
            {item.desc}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <style>
        {`
          .channel-stats-bg {
            background-image: url('${toAbsoluteUrl("/media/images/2600x1600/bg-3.png")}');
          }
          .dark .channel-stats-bg {
            background-image: url('${toAbsoluteUrl("/media/images/2600x1600/bg-3-dark.png")}');
          }
        `}
      </style>

      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
};

export { ChannelStats2, type IChannelStatsItem, type IChannelStatsItems };
