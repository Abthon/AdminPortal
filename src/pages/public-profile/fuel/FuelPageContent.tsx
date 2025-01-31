import { Fuel } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface FuelPageContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleVehicleNum: (num: any) => void;
  searchInput?: string;
}

const FuelPageContent = ({
  isAddOpen,
  _handleAddOpen,
  handleVehicleNum,
  searchInput,
}: FuelPageContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Fuel
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleVehicleNum={handleVehicleNum}
      />
    </div>
  );
};

export { FuelPageContent };
