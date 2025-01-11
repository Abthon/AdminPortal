import { Config } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface ConfigContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleConfigNum: (num: any) => void;
  searchInput?: string;
}

const ConfigContent = ({
  isAddOpen,
  _handleAddOpen,
  handleConfigNum,
  searchInput,
}: ConfigContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Config
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleConfigNum={handleConfigNum}
      />
    </div>
  );
};

export { ConfigContent };
