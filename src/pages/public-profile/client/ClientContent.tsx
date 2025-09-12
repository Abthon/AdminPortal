import { Clients } from "./blocks";

interface ClientContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleClientNum: (num: any) => void;
  searchInput?: string;
}

const ClientContent = ({
  isAddOpen,
  _handleAddOpen,
  handleClientNum,
  searchInput,
}: ClientContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Clients
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleClientNum={handleClientNum}
      />
    </div>
  );
};

export { ClientContent };
