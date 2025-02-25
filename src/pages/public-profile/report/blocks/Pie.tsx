import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useLanguage } from "@/i18n";
import { KeenIcon, Menu, MenuItem, MenuToggle } from "@/components";

import { DropdownCard2 } from "@/partials/dropdowns/general";

interface IPieProps {
  title: string;
  info: any;
}

const Pie = ({ title, info }: IPieProps) => {
  const { isRTL } = useLanguage();
  const data: number[] = [
    info?.totalActiveCorporates,
    info?.totalPendingCorporates,
    info?.totalInactiveCorporates,
    info?.totalSuspendedCorporates,
    info?.totalOverLimitCorporates,
  ];
  const labels: string[] = [
    "Active",
    "Pending",
    "InActive",
    "Suspended",
    "Over-Limit",
  ];
  const colors: string[] = [
    "var(--tw-primary)",
    "var(--tw-brand)",
    "var(--tw-success)",
    "var(--tw-info)",
    "var(--tw-warning)",
  ];

  const options: ApexOptions = {
    series: data,
    labels: labels,
    colors: colors,
    fill: {
      colors: colors,
    },
    chart: {
      type: "donut",
    },
    stroke: {
      show: true,
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    legend: {
      offsetY: -10,
      offsetX: -10,
      fontSize: "13px",
      fontWeight: "500",
      itemMargin: {
        vertical: 1,
      },
      labels: {
        colors: "var(--tw-gray-700)",
        useSeriesColors: false,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>

      <div className="card-body flex justify-center items-center px-3 py-5">
        <ApexChart
          id="Pie_chart"
          options={options}
          series={options.series}
          type="donut"
          width="100%"
          height="178.7"
        />
      </div>
    </div>
  );
};

export { Pie, type IPieProps };

// const options: ApexOptions = {
//   chart: {
//     type: "bar", // Bar chart
//     height: 350,
//   },
//   plotOptions: {
//     bar: {
//       horizontal: true, // ✅ Makes the bars horizontal
//       barHeight: "50%", // Adjust bar height for better visibility
//       distributed: true, // Gives each bar a unique color
//     },
//   },
//   xaxis: {
//     categories: ["Payroll", "Commission"], // Labels for each bar
//     title: {
//       text: "Number of Drivers", // X-axis title
//     },
//   },
//   yaxis: {
//     title: {
//       text: "Driver Type", // Y-axis title
//     },
//   },
//   series: [
//     {
//       name: "Total Drivers",
//       data: [stats?.totalPayrollDrivers, stats?.totalComissionDrivers], // Values for bars
//     },
//   ],
//   dataLabels: {
//     enabled: true,
//     style: {
//       colors: ["#fff"], // White text for labels
//     },
//   },
//   fill: {
//     opacity: 1,
//     type: "solid",
//   },
//   legend: {
//     position: "top",
//     horizontalAlign: "center",
//   },
//   grid: {
//     show: true,
//     strokeDashArray: 5, // Dotted grid lines for a cleaner look
//   },
// };
