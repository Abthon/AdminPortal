import { Fragment, useState } from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { DataGridLoader } from "@/components";

interface ReportChartProps {
  avgDeliveries: any;
  DriverData: any;
  DriverLoading: any;
}

const DistanceCovered = ({
  avgDeliveries,
  DriverData,
  DriverLoading,
}: ReportChartProps) => {
  console.log("mer", avgDeliveries);
  // console.log(DriverData.data.length, "dr.");
  let driverNames: any = [];
  let totalDistanceTravelleds: any = [];
  for (let i = 0; i < DriverData?.data?.length; i++) {
    driverNames.push(DriverData?.data?.[i]?.firstName);
    totalDistanceTravelleds.push(
      avgDeliveries?.[i]?.data?.data?.totalDistanceTravelled
    );
  }
  // const driverNames = [
  //   DriverData?.data?.[0]?.firstName,
  //   DriverData?.data?.[1]?.firstName,
  //   DriverData?.data?.[2]?.firstName,
  //   DriverData?.data?.[3]?.firstName,
  // ];
  // const totalDistanceTravelleds = [
  //   Math.round(avgDeliveries?.[0]?.totalDistanceTravelled),
  //   Math.round(avgDeliveries?.[1]?.totalDistanceTravelled),
  //   Math.round(avgDeliveries?.[2]?.totalDistanceTravelled),
  //   Math.round(avgDeliveries?.[3]?.totalDistanceTravelled),
  // ];

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
        text: "Num of Deliveries", // Title of the Y-axis
      },
      min: 0, // Minimum value for Y-axis (starting from 0)
      tickAmount: 6, // Set the number of ticks for better granularity
    },
    series: [
      {
        name: "Average Delivery Time",
        data: totalDistanceTravelleds, // Average delivery times for each driver
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

        return `<div><strong>${driver}</strong><br/>Distance Covered: ${avgTime} km</div>`;
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

  if (DriverLoading)
    // if (isDriverLoading) {
    return <DataGridLoader message="Loading" />;
  // }

  return (
    <Fragment>
      <div className="card">
        <div className="card-header" id="distance-price-info">
          <h3 className="card-title">Distance covered(km) per driver chart</h3>
        </div>
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

export { DistanceCovered };
