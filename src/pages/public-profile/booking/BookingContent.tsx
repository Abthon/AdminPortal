import { Users } from "./blocks/users";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface BookingContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
}

const BookingContent = ({ isAddOpen, _handleAddOpen }: BookingContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Users _handleAddOpen={_handleAddOpen} isAddOpen={isAddOpen} />
    </div>
  );
};

export { BookingContent };
