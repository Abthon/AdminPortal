import { Bank } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleBankNum: (num: any) => void;
  searchInput?: string;
}

const BankContent = ({
  isAddOpen,
  _handleAddOpen,
  handleBankNum,
  searchInput,
}: VehicleContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Bank
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleBankNum={handleBankNum}
      />

      {/* <MiscFaq /> */}

      {/* <MiscHelp2 /> */}
    </div>
  );
};

export { BankContent };
