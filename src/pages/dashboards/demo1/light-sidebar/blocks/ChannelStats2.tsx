import { Fragment, useEffect, useState } from "react";
import axiosInstance from "@/auth/_helpers";
import { useQuery } from "react-query";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface IAnalyticsData {
  clientStats: {
    totalClients: number;
    activeClients: number;
    inGroupClients: number;
  };
  therapistStats: {
    totalTherapists: number;
    therapistsWithSessions: number;
  };
  sessionsOverTime: Array<{
    date: string;
    count: string;
  }>;
  revenueStats: {
    totalRevenue: string;
    totalSubscriptions: string;
  };
  matchStats: {
    totalMatches: number;
    acceptedMatches: number;
  };
  engagementStats: {
    moodCount: number;
    diaryCount: number;
  };
  usersPerModal: Array<{
    modal: string;
    userCount: string;
  }>;
}

interface IStatsCard {
  icon: string;
  title: string;
  value: number | string;
  color: string;
  bgColor: string;
}

const ChannelStats2 = () => {
  const [analyticsData, setAnalyticsData] = useState<IAnalyticsData | null>(null);
  const [netTransaction, setNetTransaction] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch net transaction
  useQuery(
    'net-transaction',
    async () => {
      const { data } = await axiosInstance.get('/api/v1/subscription/user-sub?take=0&fields=price,subscription.price');
      const total = data.data.reduce((acc: number, item: any) => {
        // Use logic similar to Transaction.tsx: priority to historical price, then subscription price
        const price = item.price ?? item.subscription?.price ?? 0;
        return acc + price;
      }, 0);
      setNetTransaction(total);
      return total;
    },
    {
      refetchInterval: 30000,
    }
  );

  // Fetch analytics data
  const { data, isLoading, error } = useQuery(
    'admin-stats',
    async () => {
      const response = await axiosInstance.get('/api/v1/admin/stats');
      return response.data.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      onSuccess: (data) => {
        setAnalyticsData(data);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    }
  );

  // Prepare stats cards data
  const getStatsCards = (): IStatsCard[] => {
    if (!analyticsData) return [];

    return [
      {
        icon: "profile-circle",
        title: "Total Clients",
        value: analyticsData.clientStats.totalClients,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        icon: "people",
        title: "Active Clients",
        value: analyticsData.clientStats.activeClients,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        icon: "user",
        title: "Total Therapists",
        value: analyticsData.therapistStats.totalTherapists,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        icon: "calendar",
        title: "Total Sessions",
        value: analyticsData.therapistStats.therapistsWithSessions,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      },
      {
        icon: "dollar",
        title: "Gross Revenue",
        value: `${parseFloat(analyticsData.revenueStats.totalRevenue).toLocaleString()} Birr`,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      },
      {
        icon: "bill",
        title: "Net Revenue",
        value: `${netTransaction.toLocaleString()} Birr`,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        icon: "crown",
        title: "Total Subscriptions",
        value: analyticsData.revenueStats.totalSubscriptions,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      },
      {
        icon: "heart",
        title: "Total Matches",
        value: analyticsData.matchStats.totalMatches,
        color: "text-pink-600",
        bgColor: "bg-pink-50"
      },
      {
        icon: "check-circle",
        title: "Accepted Matches",
        value: analyticsData.matchStats.acceptedMatches,
        color: "text-teal-600",
        bgColor: "bg-teal-50"
      },
      // Users per modal cards
      ...(analyticsData.usersPerModal?.map(modalData => {
        // Assign different colors based on therapy type
        let color = "text-indigo-600";
        let bgColor = "bg-indigo-50";
        let icon = "abstract";
        
        if (modalData.modal.toLowerCase().includes('individual')) {
          color = "text-indigo-600";
          bgColor = "bg-indigo-50";
          icon = "user";
        } else if (modalData.modal.toLowerCase().includes('teen')) {
          color = "text-cyan-600";
          bgColor = "bg-cyan-50";
          icon = "user-tick";
        } else if (modalData.modal.toLowerCase().includes('couple')) {
          color = "text-rose-600";
          bgColor = "bg-rose-50";
          icon = "people";
        } else if (modalData.modal.toLowerCase().includes('group')) {
          color = "text-amber-600";
          bgColor = "bg-amber-50";
          icon = "element-11";
        }
        
        return {
          icon: icon,
          title: modalData.modal,
          value: parseInt(modalData.userCount).toLocaleString(),
          color: color,
          bgColor: bgColor
        };
      }) || [])
    ];
  };

  // Prepare chart data for sessions over time
  const getChartOptions = (): ApexOptions => {
    if (!analyticsData?.sessionsOverTime) return {};

    const chartData = analyticsData.sessionsOverTime.map(item => ({
      x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: parseInt(item.count)
    }));

    return {
      series: [{
        name: "Sessions",
        data: chartData.map(item => item.y)
      }],
      chart: {
        height: 300,
        type: "line",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
        colors: ["var(--tw-primary)"]
      },
      xaxis: {
        categories: chartData.map(item => item.x),
        labels: {
          style: {
            colors: "var(--tw-gray-500)",
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "var(--tw-gray-500)",
            fontSize: "12px",
          },
        },
      },
      grid: {
        borderColor: "var(--tw-gray-200)",
        strokeDashArray: 5,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value) => `${value} sessions`
        }
      },
      markers: {
        size: 6,
        colors: ["var(--tw-primary)"],
        strokeColors: "#fff",
        strokeWidth: 2,
      }
    };
  };

  const renderStatsCard = (card: IStatsCard, index: number) => {
    return (
      <div
        key={index}
        className="card flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg"
      >
        <div className={`p-3 rounded-full ${card.bgColor} w-fit mt-4 ms-5`}>
          <KeenIcon
            icon={card.icon}
            className={`${card.color} text-[1.75rem]`}
          />
        </div>

        <div className="flex flex-col gap-1 pb-4 px-5">
          <span className="text-3xl font-semibold text-gray-900">
            {card.value}
          </span>
          <span className="text-2sm font-normal text-gray-700">
            {card.title}
          </span>
        </div>
      </div>
    );
  };

  const renderSessionsChart = () => {
    if (!analyticsData?.sessionsOverTime?.length) {
      return (
        <div className="card h-full">
          <div className="card-header">
            <h3 className="card-title">Sessions Over Time</h3>
          </div>
          <div className="card-body flex items-center justify-center">
            <p className="text-gray-500">No session data available</p>
          </div>
        </div>
      );
    }

    const chartOptions = getChartOptions();
    
    return (
      <div className="card h-full">
        <div className="card-header">
          <h3 className="card-title">Sessions Over Time</h3>
          <div className="flex items-center gap-2">
            <span className="badge badge-light badge-sm">
              Total: {analyticsData.sessionsOverTime.reduce((sum: number, item: { date: string; count: string }) => sum + parseInt(item.count), 0)}
            </span>
          </div>
        </div>
        <div className="card-body">
          <ApexChart
            options={chartOptions}
            series={chartOptions.series}
            type="line"
            height={300}
          />
        </div>
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <Fragment>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card h-full animate-pulse">
            <div className="card-body">
              <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </Fragment>
    );
  }

  if (error) {
    return (
      <div className="card h-full">
        <div className="card-body flex items-center justify-center">
          <div className="text-center">
            <KeenIcon icon="information-5" className="text-red-500 text-4xl mb-2" />
            <p className="text-gray-500">Failed to load analytics data</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-sm btn-primary mt-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = getStatsCards();

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

      {/* Stats Cards */}
      {statsCards.map((card, index) => renderStatsCard(card, index))}
      
      {/* Sessions Chart - This will be rendered separately in the dashboard layout */}
      <div className="col-span-full">
        {renderSessionsChart()}
      </div>
    </Fragment>
  );
};

// Export a separate component for just the sessions chart if needed
const SessionsChart = () => {
  const { data: analyticsData, isLoading } = useQuery(
    'admin-stats',
    async () => {
      const response = await axiosInstance.get('/api/v1/admin/stats');
      return response.data.data;
    }
  );

  if (isLoading || !analyticsData?.sessionsOverTime?.length) {
    return (
      <div className="card h-full">
        <div className="card-header">
          <h3 className="card-title">Sessions Over Time</h3>
        </div>
        <div className="card-body flex items-center justify-center">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <p className="text-gray-500">No session data available</p>
          )}
        </div>
      </div>
    );
  }

  const chartData = analyticsData.sessionsOverTime.map((item: { date: string; count: string }) => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: parseInt(item.count)
  }));

  const chartOptions: ApexOptions = {
    series: [{
      name: "Sessions",
      data: chartData.map((item: { x: string; y: number }) => item.y)
    }],
    chart: {
      height: 300,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["var(--tw-primary)"]
    },
    xaxis: {
      categories: chartData.map((item: { x: string; y: number }) => item.x),
      labels: {
        style: {
          colors: "var(--tw-gray-500)",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "var(--tw-gray-500)",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "var(--tw-gray-200)",
      strokeDashArray: 5,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => `${value} sessions`
      }
    },
    markers: {
      size: 6,
      colors: ["var(--tw-primary)"],
      strokeColors: "#fff",
      strokeWidth: 2,
    }
  };

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Sessions Over Time</h3>
        <div className="flex items-center gap-2">
          <span className="badge badge-light badge-sm">
            Total: {analyticsData.sessionsOverTime.reduce((sum: number, item: { date: string; count: string }) => sum + parseInt(item.count), 0)}
          </span>
        </div>
      </div>
      <div className="card-body">
        <ApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="line"
          height={300}
        />
      </div>
    </div>
  );
};

export { ChannelStats2, SessionsChart, type IAnalyticsData, type IStatsCard };
