import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateISO: string): string {
  const date = new Date(dateISO);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface OwnerInfoProps {
  data: any;
}

const OwnerInfo: React.FC<OwnerInfoProps> = ({ data }) => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="owner-info">
        <h3 className="card-title">Ownership Information</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              owner
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.owner}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { OwnerInfo };
