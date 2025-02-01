import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface CoorDetailProps {
  data: any;
}

const CoorDetail: React.FC<CoorDetailProps> = ({ data }) => {
  console.log(data, "dat");
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="coor-detail">
        <h3 className="card-title">Corporate Detail</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Name
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.name}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Email
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.email}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Contact Phone Number
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              0{data.contactPhoneNumber}
            </label>
          </div>
        </div>
        {/* <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Current Credit
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.currentCredit}
            </label>
          </div>
        </div> */}
        {/* <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              creditLimit
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.creditLimit}
            </label>
          </div>
        </div> */}
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Status
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
              Created at
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {timeAgo(data.createdAt)}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CoorDetail };
