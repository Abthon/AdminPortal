import { Coorporate } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface CoorporateContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleCoorporateNum: (num: any) => void;
  searchInput?: string;
}

const CoorporateContent = ({
  isAddOpen,
  _handleAddOpen,
  handleCoorporateNum,
  searchInput,
}: CoorporateContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Coorporate
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleCoorporateNum={handleCoorporateNum}
      />
    </div>
  );
};

export { CoorporateContent };
