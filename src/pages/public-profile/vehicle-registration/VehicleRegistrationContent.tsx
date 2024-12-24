import { VehicleRegistration } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleTableContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
}

const VehicleTableContent = ({ isAddOpen, _handleAddOpen }: VehicleTableContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <VehicleRegistration _handleAddOpen={_handleAddOpen} isAddOpen={isAddOpen} />
    </div>
  );
};

export { VehicleTableContent };