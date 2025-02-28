import { Fragment } from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useLanguage } from "@/i18n";
import { KeenIcon, Menu, MenuItem, MenuToggle } from "@/components";

import { DropdownCard2 } from "@/partials/dropdowns/general";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";

const DeliveriesChart = () => {
  // Function to make a request to the API
  // async function fetchBookings(date: string) {
  //   const url = `api/v1/bookings?filters=status=completed,createdAt=${date}`;
  //   try {
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     console.log(`Data for ${date}:`, data);
  //   } catch (error) {
  //     console.error(`Error fetching data for ${date}:`, error);
  //   }
  // }

  const getLast7Days = (): string[] => {
    const dates: string[] = [];

    for (let i = 6; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Subtract i days from today

      const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
      const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year

      dates.push(`20${year}-${month}-${day}`);
    }

    return dates;
  };

  const getBookings = async (): Promise<any[]> => {
    const dates = getLast7Days();
    const driverData = await Promise.all(
      dates.map(async (date) => {
        try {
          const url = `api/v1/bookings?filters=status=completed,createdAt=${date}`;
          console.log("url", url);
          const { data } = await axiosInstance.get(url); // Change to GET
          console.log("data", data?.data, "date", date);
          return data?.data.length;
        } catch (error) {
          console.error(`Error fetching data for date ${date}:`, error);
          return null;
        }
      })
    );

    return driverData; // Return the data
  };

  const { isLoading: isDepositLoading, data: bookingData } = useQuery({
    queryKey: ["Bookings"],
    queryFn: getBookings, // No parameters needed
  });

  console.log(bookingData, "bood");

  const { isRTL } = useLanguage();
  const data: any[] = bookingData ?? [];
  const dates = getLast7Days();
  const categories: string[] = dates;

  const options: ApexOptions = {
    series: [
      {
        name: "series1",
        data: data,
      },
    ],
    chart: {
      height: 250,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      curve: "smooth",
      show: true,
      width: 3,
      colors: ["var(--tw-primary)"],
    },
    xaxis: {
      categories: categories,
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
      crosshairs: {
        position: "front",
        stroke: {
          color: "var(--tw-primary)",
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: false,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 4,
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "var(--tw-gray-500)",
          fontSize: "12px",
        },
        formatter: (defaultValue: number) => `  ${defaultValue}`,
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const xValue = w.globals.labels[dataPointIndex];

        // Get the Y value (data at the current index)
        const yValue = series[seriesIndex][dataPointIndex];

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-2sm text-gray-600">${yValue}</div>
          </div>
        `;
      },
    },
    markers: {
      size: 0,
      colors: "var(--tw-primary-light)",
      strokeColors: "var(--tw-primary)",
      strokeWidth: 4,
      strokeOpacity: 1,
      strokeDashArray: 0,
      fillOpacity: 1,
      shape: "circle",
      showNullDataPoints: true,
      hover: {
        size: 8,
        sizeOffset: 0,
      },
      discrete: [],
      offsetX: 0,
      offsetY: 0,
    },
    fill: {
      gradient: {
        opacityFrom: 0.25,
        opacityTo: 0,
      },
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
        <div className="card-header">
          <h3 className="card-title">Bookings</h3>

          <Menu>
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? "bottom-start" : "bottom-end",
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                    },
                  },
                ],
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard2()}
            </MenuItem>
          </Menu>
        </div>
        <div className="px-3 py-1">
          <ApexChart
            id="media_uploads_chart"
            options={options}
            series={options.series}
            type="area"
            max-width="694"
            height="250"
          />
        </div>
      </div>
    </Fragment>
  );
};

export { DeliveriesChart };
