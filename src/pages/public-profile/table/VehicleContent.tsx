import { Users } from "./blocks/users";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
}

const VehicleContent = ({ isAddOpen, _handleAddOpen }: VehicleContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Users _handleAddOpen={_handleAddOpen} isAddOpen={isAddOpen} />

      {/* <MiscFaq /> */}

      {/* <MiscHelp2 /> */}
    </div>
  );
};

export { VehicleContent };
