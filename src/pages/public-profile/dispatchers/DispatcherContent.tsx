import { Dispatcher } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface VehicleContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleDispatcherNum: (num: any) => void;
  searchInput?: string;
}

const DispatcherContent = ({
  isAddOpen,
  _handleAddOpen,
  handleDispatcherNum,
  searchInput,
}: VehicleContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Dispatcher
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleDispatcherNum={handleDispatcherNum}
      />

      {/* <MiscFaq /> */}

      {/* <MiscHelp2 /> */}
    </div>
  );
};

export { DispatcherContent };
