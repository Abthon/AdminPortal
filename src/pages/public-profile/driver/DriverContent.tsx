import { Drivers } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleDriverNum: (num: any) => void;
}

const DriverContent = ({
  isAddOpen,
  _handleAddOpen,
  handleDriverNum,
}: VehicleContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Drivers
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        handleDriverNum={handleDriverNum}
      />

      {/* <MiscFaq /> */}

      {/* <MiscHelp2 /> */}
    </div>
  );
};

export { DriverContent };
