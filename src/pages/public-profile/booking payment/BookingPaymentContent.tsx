import { Booking } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface BookingPaymentContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleBookingNum: (num: any) => void;
  searchInput?: string;
  activeTab?: string;
}

const BookingPaymentContent = ({
  isAddOpen,
  _handleAddOpen,
  handleBookingNum,
  searchInput,
  activeTab,
}: BookingPaymentContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Booking
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleBookingNum={handleBookingNum}
        activeTab={activeTab}
      />
    </div>
  );
};

export { BookingPaymentContent };
