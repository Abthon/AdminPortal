import { Config } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface ConfigContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
}

const ConfigContent = ({ isAddOpen, _handleAddOpen }: ConfigContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Config _handleAddOpen={_handleAddOpen} isAddOpen={isAddOpen} />
    </div>
  );
};

export { ConfigContent };
