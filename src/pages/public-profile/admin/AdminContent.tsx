import { Admins } from "./blocks";
import { ModalAdminForm } from "@/partials/modals/admin";

interface IAdminContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleAdminNum: (num: any) => void;
  searchInput?: string;
}

const AdminContent = ({
  isAddOpen,
  _handleAddOpen,
  handleAdminNum,
  searchInput,
}: IAdminContentProps) => {
  return (
    <>
      <Admins
        isAddOpen={isAddOpen}
        _handleAddOpen={_handleAddOpen}
        handleAdminNum={handleAdminNum}
        searchInput={searchInput}
      />
      
      {/* Add Admin Modal */}
      <ModalAdminForm
        open={isAddOpen}
        onOpenChange={() => _handleAddOpen(false)}
      />
    </>
  );
};

export { AdminContent };
