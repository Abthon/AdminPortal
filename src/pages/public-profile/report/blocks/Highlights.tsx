import { KeenIcon } from "@/components";
import { useLanguage } from "@/i18n";

interface IBookingStatus {
  id: string;
  label: string;
  icon: string;
  count: number;
  color: string;
  bgColor: string;
  percentage: number;
}

interface IHighlightsProps {
  data: any;
}

const Highlights = ({ data }: IHighlightsProps) => {
  const { isRTL } = useLanguage();

  const totalBookings = data?.totalBooking || 1;

  const bookingStatuses: IBookingStatus[] = [
    {
      id: "completed",
      label: "Completed",
      icon: "check-circle",
      count: data?.totalCompletedBookings || 0,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      percentage: ((data?.totalCompletedBookings || 0) / totalBookings) * 100,
    },
    {
      id: "requested",
      label: "Requested",
      icon: "time",
      count: data?.totalRequestedBookings || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      percentage: ((data?.totalRequestedBookings || 0) / totalBookings) * 100,
    },
    {
      id: "assigned",
      label: "Assigned",
      icon: "user-check",
      count: data?.totalAssignedBookings || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      percentage: ((data?.totalAssignedBookings || 0) / totalBookings) * 100,
    },
    {
      id: "started",
      label: "Started",
      icon: "play",
      count: data?.totalStartedBookings || 0,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-200",
      percentage: ((data?.totalStartedBookings || 0) / totalBookings) * 100,
    },
    {
      id: "end",
      label: "Ended",
      icon: "clock",
      count: data?.totalAssignedBookings || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      percentage: ((data?.totalTimeoutBookings || 0) / totalBookings) * 100,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: "close-circle",
      count: data?.totalCancelledBookings || 0,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      percentage: ((data?.totalCancelledBookings || 0) / totalBookings) * 100,
    },
    {
      id: "driver-not-found",
      label: "Driver Not Found",
      icon: "user-remove",
      count: data?.totalDriverNotFoundBookings || 0,
      color: "text-gray-600",
      bgColor: "bg-gray-50 border-gray-200",
      percentage:
        ((data?.totalDriverNotFoundBookings || 0) / totalBookings) * 100,
    },
  ];

  const StatusCard = ({ status }: { status: IBookingStatus }) => (
    <div
      className={`
      border rounded-lg 
      p-2 xs:p-3 sm:p-4 md:p-3 lg:p-4 xl:p-5
      ${status.bgColor} 
      hover:shadow-md transition-all duration-200
      min-h-[100px] xs:min-h-[110px] sm:min-h-[120px] md:min-h-[115px] lg:min-h-[125px]
      flex flex-col justify-between
    `}
    >
      {/* Header with icon and percentage */}
      <div className="flex items-start justify-between mb-2 xs:mb-2 sm:mb-3">
        <div
          className={`
          p-1 xs:p-1.5 sm:p-2 md:p-1.5 lg:p-2 
          rounded-md sm:rounded-lg 
          ${status.bgColor} 
          flex-shrink-0
        `}
        >
          <KeenIcon
            icon={status.icon}
            className={`
            text-sm xs:text-base sm:text-lg md:text-base lg:text-lg xl:text-xl 
            ${status.color}
          `}
          />
        </div>
        <span className="text-xs xs:text-xs sm:text-xs md:text-xs lg:text-sm font-medium text-gray-500 ml-2">
          {status.percentage.toFixed(1)}%
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="space-y-1">
          <h4
            className="
            text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl 
            font-bold text-gray-900 
            leading-tight
          "
          >
            {status.count}
          </h4>
          <p
            className="
            text-xs xs:text-xs sm:text-sm md:text-xs lg:text-sm 
            font-medium text-gray-600 
            leading-tight
            line-clamp-2
          "
          >
            {status.label}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Total Bookings
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 truncate">
                {data?.totalBooking || 0}
              </h3>
            </div>
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg ml-3 flex-shrink-0">
              <KeenIcon icon="chart-line" className="text-xl sm:text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-green-100 text-xs sm:text-sm font-medium">
                Total Deducted
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1">
                {data?.totalEarnings || 0} Birr
              </h3>
            </div>
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg ml-3 flex-shrink-0">
              <KeenIcon icon="dollar" className="text-xl sm:text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile List View */}
      <div className="block xs:hidden bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Status Summary
        </h3>
        <div className="space-y-3">
          {bookingStatuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between py-3 px-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${status.bgColor}`}
                >
                  {/* <KeenIcon
                    icon={status.icon}
                    className={`text-base ${status.color}`}
                  /> */}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {status.label}
                  </p>
                </div>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className="text-lg font-bold text-gray-900">
                  {status.count}
                </div>
                <div className="text-xs text-gray-500">
                  {status.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { Highlights, type IHighlightsProps };
