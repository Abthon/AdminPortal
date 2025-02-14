import { Fragment } from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const DriverDeliveryChart = () => {
  const driverNames = [
    "Driver 1",
    "Driver 2",
    "Driver 3",
    "Driver 4",
    "Driver 5",
  ];
  const averageDeliveryTimes = [0, 20, 12, 18, 25];

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
