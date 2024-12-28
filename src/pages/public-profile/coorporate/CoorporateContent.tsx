import { Coorporate } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface CoorporateContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
}

const CoorporateContent = ({
  isAddOpen,
  _handleAddOpen,
}: CoorporateContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Coorporate _handleAddOpen={_handleAddOpen} isAddOpen={isAddOpen} />
    </div>
  );
};

export { CoorporateContent };
