import { CrudAvatarUpload } from "@/partials/crud";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeenIcon } from "@/components";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DropOffInfoProps {
  data: any;
}

const DropOffInfo: React.FC<DropOffInfoProps> = ({ data }) => {
  const [date, setDate] = useState<Date | undefined>(new Date(1984, 0, 20));
  const [nameInput, setNameInput] = useState("Jason Tatum");
  const [companyInput, setCompanyInput] = useState("KeenThemes");

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="dropoff-info">
        <h3 className="card-title">Drop off Information</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              dropOffName
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.dropOffName}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              dropOffLat
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.dropOffLat}
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <label className="form-label flex items-center gap-1 max-w-56">
              dropOffLng
            </label>
            <label className="form-label flex items-center gap-1 max-w-56">
              {data.dropOffLng}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DropOffInfo };
