import { Therapists } from "./blocks";

interface TherapistContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleTherapistNum: (num: any) => void;
  searchInput?: string;
}

const TherapistContent = ({
  isAddOpen,
  _handleAddOpen,
  handleTherapistNum,
  searchInput,
}: TherapistContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Therapists
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleTherapistNum={handleTherapistNum}
      />
    </div>
  );
};

export { TherapistContent };
