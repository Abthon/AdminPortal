import { Booking } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface BookingContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleBookingNum: (num: any) => void;
  searchInput?: string;
}

const BookingContent = ({
  isAddOpen,
  _handleAddOpen,
  handleBookingNum,
  searchInput,
}: BookingContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Booking
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleBookingNum={handleBookingNum}
      />
    </div>
  );
};

export { BookingContent };
