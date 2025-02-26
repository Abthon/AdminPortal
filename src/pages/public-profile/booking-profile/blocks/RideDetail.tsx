import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface RideDetailProps {
  data: any;
}

const RideDetail: React.FC<RideDetailProps> = ({ data }) => {
  console.log(data, "d");
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="ride-detail">
        <h3 className="card-title">Ride Detail</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Id
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data?.id}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Booking Created At
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {timeAgo(data?.createdAt)}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Status
            </label>
            <span
              className={`badge badge-sm ${data?.status === "suspended" && "badge-danger"} ${data?.status === "inactive" && "badge-warning"} ${data.status === "active" && "badge-success"} ${data.status === "requested" && "badge-primary"} badge-outline`}
            >
              {data?.status}
            </span>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Pickup Name
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data?.pickupName || "-"}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              DropOff Name
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data?.dropOffName || "-"}
            </label>
          </div>
        </div>

        {data.admin?.firstName ? (
          <div className="w-full">
            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label flex items-center gap-1 max-w-56">
                Admin Name
              </label>
              <label className="form-label flex items-center gap-1 max-w-56">
                {data.admin?.firstName + " " + data.admin?.lastName || "-"}
              </label>
            </div>
          </div>
        ) : (
          ""
        )}

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Coorporate Name
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data?.coor?.name || "-"}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Remark
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.remark || "-"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RideDetail };
