import { VechileType } from "./blocks/users";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleTableContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
}

const VehicleContent = ({ isAddOpen, _handleAddOpen }: VehicleTableContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <VechileType _handleAddOpen={_handleAddOpen} isAddOpen={isAddOpen} />
    </div>
  );
};

export { VehicleContent };