import { Fragment, useState } from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { DataGridLoader } from "@/components";

interface ReportChartProps {
  stats: any;
}

const DriversInfo = ({ stats }: ReportChartProps) => {
  console.log("mer", stats);
  // console.log(DriverData.data.length, "dr.");

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
      categories: ["Payroll", "Comission"], // Set the driver names as categories (X-axis)
      title: {
        text: "Drivers", // Title of the X-axis
      },
    },
    yaxis: {
      title: {
        text: "Driver Types", // Title of the Y-axis
      },
      min: 0, // Minimum value for Y-axis (starting from 0)
      tickAmount: 6, // Set the number of ticks for better granularity
    },
    series: [
      {
        name: "Average Delivery Time",
        data: [stats?.totalPayrollDrivers, stats?.totalComissionDrivers], // Average delivery times for each driver
      },
    ],
    dataLabels: {
      enabled: true, // Show the data labels on the bars
      style: {
        colors: ["#fff"], // White color for the labels inside bars
      },
    },
    tooltip: {
      enabled: false,
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

  return (
    <Fragment>
      <div className="card">
        <div className="card-header" id="distance-price-info">
          <h3 className="card-title">Payroll vs Comissioned Drivers</h3>
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

export { DriversInfo };
