import axiosInstance from "@/auth/_helpers";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";

interface IStatisticsItem {
  number: string;
  label: string;
}
interface IStatisticsItems extends Array<IStatisticsItem> {}

interface IStatisticsProps {
  items: IStatisticsItem[];
}

const CardSkeleton = () => {
  return (
    <div className="card animate-pulse">
      <div className="card-body">
        <div className="flex lg:px-10 py-1.5 gap-2">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-300 rounded-md h-14"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
const Statistics = () => {
  const { id } = useParams();
  console.log(id, "id");
  const fetchDriverStats = async () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US");
    //console.log(formattedDate, "date");

    //const url = `/api/v1/deposit/stats?startDate=2024-02-01&endDate=${formattedDate}`;
    const url = `/api/v1/drivers/me/stats?startDate=2024-01-01&endDate=${formattedDate}`;

    try {
      const { data } = await axiosInstance.post(url, { driverId: id });
      console.log("data hehe", data?.data);
      return data?.data; // Store id and response data
    } catch (error) {
      console.error(`Error fetching data for driver`, error);
      return null; // Handle errors gracefully
    }
  };

  const { isLoading: isDriverLoading, data: DriverData } = useQuery({
    queryKey: ["Drivers"],
    queryFn: fetchDriverStats,
  });

  const items: any = [
    {
      number: DriverData?.averageDeliveryTime,
      label: "Avg Delivery Time (min)",
    },
    {
      number: DriverData?.totalDistanceTravelled,
      label: "Tot Distance Covered (km)",
    },

    { number: DriverData?.completedBookings, label: "Num Of Deliveries" },
    // { number: "27", label: "Company Rank" },
  ];

  const renderItems = (item: IStatisticsItem, index: number) => {
    return (
      <React.Fragment key={index}>
        <div className="grid grid-cols-1 place-content-center flex-1 gap-1 text-center">
          <span className="text-gray-900 text-2xl lg:text-2.5xl leading-none font-semibold">
            {item.number}
          </span>
          <span className="text-gray-700 text-sm">{item.label}</span>
        </div>

        <span className="[&:not(:last-child)]:border-e border-e-gray-300 my-1"></span>
      </React.Fragment>
    );
  };

  if (isDriverLoading) return <CardSkeleton />;

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex lg:px-10 py-1.5 gap-2">
          {items.map((item: any, index: any) => {
            return renderItems(item, index);
          })}
        </div>
      </div>
    </div>
  );
};

export {
  Statistics,
  type IStatisticsItem,
  type IStatisticsItems,
  type IStatisticsProps,
};
