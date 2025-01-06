import { VechileType } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleTableContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleVehicleTypeNum: (num: any) => void;
}

const VehicleContent = ({
  isAddOpen,
  _handleAddOpen,
  handleVehicleTypeNum,
}: VehicleTableContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <VechileType
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        handleVehicleTypeNum={handleVehicleTypeNum}
      />
    </div>
  );
};

export { VehicleContent };
