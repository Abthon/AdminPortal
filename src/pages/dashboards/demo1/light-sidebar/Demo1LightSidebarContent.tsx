import axiosInstance from "@/auth/_helpers";
import {
  ChannelStats,
  EarningsChart,
  EntryCallout,
  Highlights,
  TeamMeeting,
  Teams,
} from "./blocks";
import { DriverLocation } from "./blocks/DriverLocation";
import { useQuery } from "react-query";
import { KeenIcon } from "@/components";
import { ChannelStats2, SessionsChart } from "./blocks/ChannelStats2";
import { Contributions } from "./blocks/Contributions";

// Removed IDriversData interface as it's no longer needed

const DashboardSkeleton = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5 pb-12 animate-pulse">
      {/* Analytics Stats Cards Placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5 h-full items-stretch">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-300 rounded-md h-36"></div>
        ))}
      </div>

      {/* Sessions Chart Placeholder */}
      <div className="bg-gray-300 rounded-md w-full h-80"></div>
    </div>
  );
};

const Demo1LightSidebarContent = () => {
  // Fetch analytics data using the new endpoint
  const { data: analyticsData, isLoading: isAnalyticsLoading, error } = useQuery(
    'admin-analytics',
    async () => {
      const response = await axiosInstance.get('/api/v1/admin/stats');
      return response.data.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchIntervalInBackground: true,
    }
  );

  if (isAnalyticsLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <KeenIcon icon="information-5" className="text-red-500 text-4xl mb-2" />
          <p className="text-gray-500 mb-4">Failed to load analytics data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:gap-7.5 pb-12">
      {/* Analytics Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7.5 h-full items-stretch">
        <ChannelStats2 />
      </div>

      {/* Additional Analytics Components */}
      <div className="grid gap-5 lg:gap-7.5">
        {/* Sessions Chart */}
        {/*<div className="col-span-full">
          <SessionsChart />
        </div>*/}
        
        {/* Additional insights can be added here */}
        {analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
            {/* Engagement Stats Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Engagement Stats</h3>
              </div>
              <div className="card-body">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Mood Entries</span>
                  <span className="font-semibold">{analyticsData.engagementStats.moodCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Diary Entries</span>
                  <span className="font-semibold">{analyticsData.engagementStats.diaryCount}</span>
                </div>
              </div>
            </div>

            {/* Match Success Rate Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Match Success Rate</h3>
              </div>
              <div className="card-body">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analyticsData.matchStats.totalMatches > 0 
                      ? Math.round((analyticsData.matchStats.acceptedMatches / analyticsData.matchStats.totalMatches) * 100)
                      : 0}%
                  </div>
                  <p className="text-gray-600 text-sm">
                    {analyticsData.matchStats.acceptedMatches} of {analyticsData.matchStats.totalMatches} matches accepted
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Per Subscription Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Avg Revenue per Sub</h3>
              </div>
              <div className="card-body">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    ${parseInt(analyticsData.revenueStats.totalSubscriptions) > 0 
                      ? Math.round(parseFloat(analyticsData.revenueStats.totalRevenue) / parseInt(analyticsData.revenueStats.totalSubscriptions))
                      : 0}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Average revenue per subscription
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Demo1LightSidebarContent };
