import { Fragment, useState } from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { DataGridLoader } from "@/components";

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

const fetchDriverStats = async (userIds: number[]) => {
  const url = `/api/v1/drivers/me/stats?startDate=2024-01-01&endDate=2025-02-13`;
  const driverData = await Promise.all(
    userIds.map(async (id) => {
      try {
        const { data } = await axiosInstance.post(url, { driverId: id });
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

const DriverDeliveryChart = () => {
  const [driverDatas, setDriverDatas] = useState([]);
  const [avgDeliveries, setAvgDeliveres] = useState<any>([]);
  async function getDrivers() {
    const url = `/api/v1/drivers?fields=id,firstName,lastName`;
    const { data } = await axiosInstance.get(url);
    const userIds = extractUserIds(data.data);
    //  console.log(userIds, "userIds");
    // const url2 = `/api/v1/drivers/me/stats?startDate=2024-01-01&endDate=2025-02-13`;
    const driverData2 = await fetchDriverStats(userIds);
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

  console.log(avgDeliveries, "me me");

  const driverNames = [
    DriverData?.data?.[0]?.firstName,
    DriverData?.data?.[1]?.firstName,
    DriverData?.data?.[2]?.firstName,
    DriverData?.data?.[3]?.firstName,
    DriverData?.data?.[4]?.firstName,
  ];
  const averageDeliveryTimes = [
    Math.round(avgDeliveries?.[0]?.averageDeliveryTime),
    Math.round(avgDeliveries?.[1]?.averageDeliveryTime),
    Math.round(avgDeliveries?.[2]?.averageDeliveryTime),
    Math.round(avgDeliveries?.[3]?.averageDeliveryTime),
    Math.round(avgDeliveries?.[4]?.averageDeliveryTime),
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar", // Vertical bar chart
      height: 350,
    },
    plotOptions: {
      bar: {
        columnWidth: "70%", // Adjust the width of the bars
      },
    },
    xaxis: {
      categories: driverNames, // Set the driver names as categories (X-axis)
      title: {
        text: "Drivers", // Title of the X-axis
      },
    },
    yaxis: {
      title: {
        text: "Average Delivery Time (minutes)", // Title of the Y-axis
      },
      min: 0, // Minimum value for Y-axis (starting from 0)
      tickAmount: 6, // Set the number of ticks for better granularity
    },
    series: [
      {
        name: "Average Delivery Time",
        data: averageDeliveryTimes, // Average delivery times for each driver
      },
    ],
    dataLabels: {
      enabled: true, // Show the data labels on the bars
      style: {
        colors: ["#fff"], // White color for the labels inside bars
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const driver = driverNames[dataPointIndex];
        const avgTime = series[seriesIndex][dataPointIndex];

        return `<div><strong>${driver}</strong><br/>Average Delivery Time: ${avgTime} minutes</div>`;
      },
    },
    fill: {
      opacity: 1,
      type: "solid", // Solid fill for the bars
    },
    // grid: {
    //   show: true, // Enable gridlines
    // },
    legend: {
      position: "top", // Position of the legend
      horizontalAlign: "center", // Center the legend
    },
  };

  if (isDriverLoading)
    // if (isDriverLoading) {
    return <DataGridLoader message="Loading" />;
  // }

  return (
    <Fragment>
      <div className="card">
        <div className="px-3 py-1">
          <ApexChart
            id="media_uploads_chart"
            options={options}
            series={options.series}
            type="bar"
            max-width="694"
            height="350"
          />
        </div>
      </div>
    </Fragment>
  );
};

export { DriverDeliveryChart };
