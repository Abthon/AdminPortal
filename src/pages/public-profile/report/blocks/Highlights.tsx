import { KeenIcon, Menu, MenuItem, MenuToggle } from "@/components";
import { useLanguage } from "@/i18n";

interface IHighlightsRow {
  icon: string;
  text: string;
  total: number;
}
interface IHighlightsRows extends Array<IHighlightsRow> {}

interface IHighlightsItem {
  badgeColor: string;
  lebel: string;
}
interface IHighlightsItems extends Array<IHighlightsItem> {}

interface IHighlightsProps {
  data: any;
}

const Highlights = ({ data }: IHighlightsProps) => {
  const { isRTL } = useLanguage();

  const rows: IHighlightsRows = [
    {
      icon: "like",
      text: "Completed",
      total: data?.totalCompletedBookings,
    },
    {
      icon: "information-2",
      text: "OnGoing",
      total:
        data?.totalTimeoutBookings +
        data?.totalCancelledBookings +
        data?.totalDriverNotFoundBookings,
    },
    {
      icon: "dislike",
      text: "Failed",
      total:
        data?.totalAssignedBookings +
        data?.totalStartedBookings +
        data?.totalRequestedBookings,
    },
  ];

  console.log(
    "stats",
    (data?.totalCompletedBookings / data?.totalBooking) * 100
  );

  const items: IHighlightsItems = [
    { badgeColor: "badge-success", lebel: "Completed" },
    { badgeColor: "badge-danger", lebel: "Failed" },
    { badgeColor: "badge-warning", lebel: "OnGoing" },
  ];

  const renderRow = (row: IHighlightsRow, index: number) => {
    return (
      <div
        key={index}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center gap-1.5">
          <KeenIcon icon={row.icon} className="text-base text-gray-500" />
          <span className="text-sm font-normal text-gray-900">{row.text}</span>
        </div>

        <div className="flex items-center text-sm font-medium text-gray-800 gap-6">
          {" "}
          <span className="lg:text-right">{row.total}</span>
        </div>
      </div>
    );
  };

  const renderItem = (item: IHighlightsItem, index: number) => {
    return (
      <div key={index} className="flex items-center gap-1.5">
        <span className={`badge badge-dot size-2 ${item.badgeColor}`}></span>
        <span className="text-sm font-normal text-gray-800">{item.lebel}</span>
      </div>
    );
  };

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Highlights</h3>
      </div>

      <div className="card-body flex flex-col gap-4 p-5 lg:p-7.5 lg:pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-normal text-gray-700">
            All Bookings
          </span>

          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-semibold text-gray-900">
              {data?.totalBooking}
            </span>
            {/* <span className="badge badge-outline badge-success badge-sm">
              +2.7%
            </span> */}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-1.5">
          <div
            className="bg-success h-2 rounded-sm"
            style={{
              width: `${(data?.totalCompletedBookings / data?.totalBooking) * 100}%`,
            }}
          ></div>
          <div
            className="bg-brand h-2 rounded-sm"
            style={{
              width: `${((data?.totalTimeoutBookings + data?.totalCancelledBookings + data?.totalDriverNotFoundBookings) / data?.totalBooking) * 100}%`,
            }}
          ></div>
          <div
            className="bg-warning h-2 rounded-sm"
            style={{
              width: `${((data?.totalAssignedBookings + data?.totalStartedBookings + data?.totalRequestedBookings) / data?.totalBooking) * 100}%`,
            }}
          ></div>
        </div>

        <div className="flex items-center flex-wrap gap-4 mb-1">
          {items.map((item, index) => {
            return renderItem(item, index);
          })}
        </div>

        <div className="border-b border-gray-300"></div>

        <div className="grid gap-3">{rows.slice(0, 3).map(renderRow)}</div>
      </div>
    </div>
  );
};

export {
  Highlights,
  type IHighlightsRow,
  type IHighlightsRows,
  type IHighlightsItem,
  type IHighlightsItems,
  type IHighlightsProps,
};
