import { Sessions } from "./blocks";

interface SessionContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleSessionNum: (num: any) => void;
  searchInput?: string;
}

const SessionContent = ({
  isAddOpen,
  _handleAddOpen,
  handleSessionNum,
  searchInput,
}: SessionContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Sessions
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleSessionNum={handleSessionNum}
      />
    </div>
  );
};

export { SessionContent };
