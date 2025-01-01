import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface VehicleIdInfoProps {
  data: any;
}

const VehicleIdInfo: React.FC<VehicleIdInfoProps> = ({ data }) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="vehicle-id">
        <h3 className="card-title">Vehicle Identifiction</h3>
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
              Plate Number
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.plate_number}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VehicleIdInfo };
