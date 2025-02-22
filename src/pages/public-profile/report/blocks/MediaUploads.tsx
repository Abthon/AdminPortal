import { Fragment } from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";

const MediaUploads = () => {
  async function getStats() {
    const response = await axiosInstance.get(`/api/v1/admin/sys/stats`);
    console.log(response?.data, "response stat");
    return response.data;
  }

  let { isLoading: isDriverLoading, data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });
  const Normalize = (num: number[], totalNum: number) => {
    // Check if num array is empty or totalNum is invalid
    if (!num || !num.length || !totalNum) return 0;

    // Calculate the sum of the array
    const sum = num.reduce((acc, current) => acc + current, 0);

    // Return the normalized value
    return Math.round((sum / totalNum) * 100);
  };

  console.log(
    "here,",
    Normalize(
      [
        statsData?.data?.totalRequestedBookings,
        statsData?.data?.totalRequestedBookings,
      ],
      statsData?.data?.totalBooking
    )
  );

  const test = {
    totalBooking: 6,
    totalStartedBookings: 0,
    totalAssignedBookings: 0,
    totalRequestedBookings: 3,
    totalCompletedBookings: 0,
    totalCancelledBookings: 0,
    totalTimeoutBookings: 0,
    totalDriverNotFoundBookings: 3,
  };

  const categories: string[] = ["Jan"]; // Only one x-axis label

  const options: ApexOptions = {
    series: [
      {
        name: "Succesful Delivery",
        data: [
          Normalize(
            [statsData?.data?.totalCompletedBookings],
            statsData?.data?.totalBooking
          ),
          // statsData?.data?.CompletedBookings / statsData?.data?.totalBooking,
        ],
      },
      {
        name: "OnGoing Delivery",
        data: [
          Normalize(
            [
              statsData?.data?.totalStartedBookings,
              statsData?.data?.totalAssignedBookings,
              statsData?.data?.totalRequestedBookings,
            ],
            statsData?.data?.totalBooking
          ),
        ],
      },
      {
        name: "Failed Delivery",
        data: [
          Normalize(
            [
              statsData?.data?.totalCancelledBookings,
              statsData?.data?.totalTimeoutBookings,
              statsData?.data?.totalDriverNotFoundBookings,
            ],
            statsData?.data?.totalBooking
          ),
        ],
      },
    ],
    chart: {
      height: 150,
      type: "bar", // Bar chart type
      stacked: true, // Enable stacking of bars
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true, // Make the bars horizontal
        columnWidth: "80%", // Adjust the column width for better appearance
      },
    },
    dataLabels: {
      enabled: true, // Enable data labels to display values on the bars
      style: {
        colors: ["#000"], // White text color to make it readable on the bars
        fontSize: "12px", // Adjust font size
      },
      formatter: (value: any) => {
        console.log(value, "val");

        if (typeof value === "number") return `${value}%`;
        else return ""; // Simply display the value on the bar
      },
    },
    legend: {
      show: false, // Disable the legend if you don't need it
    },
    xaxis: {
      categories: categories, // Only one category, i.e., "Jan"
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "var(--tw-gray-500)",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        style: {
          colors: "var(--tw-gray-500)",
          fontSize: "12px",
        },
        formatter: (defaultValue: number) => `${defaultValue}`, // Display percentage on the Y-axis
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        // Get the title of the series (name of each series)
        const title = w.config.series[seriesIndex].name;

        // Get the value of the series at the hovered index
        const value = series[seriesIndex][dataPointIndex];

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-2sm text-gray-600">${title}</div> <!-- Individual title for the series -->
            <div class="font-semibold text-md text-gray-900">${value}</div> <!-- Value of the hovered bar -->
          </div>
        `;
      },
    },

    fill: {
      colors: ["#17C653", "#1B84FF", "#F8285A"], // Customize fill colors as needed
    },
    grid: {
      borderColor: "var(--tw-gray-200)",
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  return (
    <Fragment>
      <div className="card">
        <div className="card-header" id="distance-price-info">
          <h3 className="card-title">Successful & Failed Deliveries Chart</h3>
        </div>
        <div className="px-3 py-1">
          <ApexChart
            id="media_uploads_chart"
            options={options}
            series={options.series}
            type="bar"
            max-width="694"
            height="150"
          />
        </div>
      </div>
    </Fragment>
  );
};

export { MediaUploads };
