import { Booking } from "./blocks/Booking";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";
import { Deposit } from "./blocks/Deposit";

interface CoorProfileContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  // handleBookingNum: (num: any) => void;
  searchInput?: string;
  id: any;
  activeTab: string;
}

const CoorProfileContent = ({
  isAddOpen,
  _handleAddOpen,
  searchInput,
  id,
  activeTab,
}: CoorProfileContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {activeTab === "bookings" ? (
        <Booking
          _handleAddOpen={_handleAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          id={id}
        />
      ) : (
        <Deposit
          _handleAddOpen={_handleAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          id={id}
        />
      )}
    </div>
  );
};

// export { BookingContent };

export { CoorProfileContent };
