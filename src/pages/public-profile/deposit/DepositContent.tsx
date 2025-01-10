import { Deposit } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleDriverNum: (num: any) => void;
  searchInput?: string;
}

const DepositContent = ({
  isAddOpen,
  _handleAddOpen,
  handleDriverNum,
  searchInput,
}: VehicleContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Deposit
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleDriverNum={handleDriverNum}
      />

      {/* <MiscFaq /> */}

      {/* <MiscHelp2 /> */}
    </div>
  );
};

export { DepositContent };
