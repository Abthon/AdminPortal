import { Coorporate } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface CoorporateContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleCoorporateNum: (num: any) => void;
}

const CoorporateContent = ({
  isAddOpen,
  _handleAddOpen,
  handleCoorporateNum,
}: CoorporateContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Coorporate
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        handleCoorporateNum={handleCoorporateNum}
      />
    </div>
  );
};

export { CoorporateContent };
