import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface RideDetailProps {
  data: any;
}

const RideDetail: React.FC<RideDetailProps> = ({ data }) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="ride-detail">
        <h3 className="card-title">Ride Detail</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              id
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.id}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Created at
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {timeAgo(data.createdAt)}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              status
            </label>
            <span
              className={`badge badge-sm ${data.status === "suspended" && "badge-danger"} ${data.status === "inactive" && "badge-warning"} ${data.status === "active" && "badge-success"} ${data.status === "requested" && "badge-primary"} badge-outline`}
            >
              {data.status}
            </span>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              remark
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
