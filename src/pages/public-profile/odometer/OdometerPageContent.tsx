import { Odometer } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface OdometerPageContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleVehicleNum: (num: any) => void;
  searchInput?: string;
}

const OdometerPageContent = ({
  isAddOpen,
  _handleAddOpen,
  handleVehicleNum,
  searchInput,
}: OdometerPageContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Odometer
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleVehicleNum={handleVehicleNum}
      />
    </div>
  );
};

export { OdometerPageContent };
