import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface VehicleDetailsProps {
  data: any;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ data }) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="vehicle-detail">
        <h3 className="card-title">Vehicle Details</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Make
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.make}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Model
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.model}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Year
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.year}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              Color
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.color}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VehicleDetails };
