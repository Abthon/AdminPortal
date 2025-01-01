import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface PathInfoProps {
  data: any;
}

const PathInfo: React.FC<PathInfoProps> = ({ data }) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="path-info">
        <h3 className="card-title">Path Information</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              polyline
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.polyline}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              estimatedTraveledPath
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.estimatedTraveledPath}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              actualTraveledPath
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.actualTraveledPath}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PathInfo };
