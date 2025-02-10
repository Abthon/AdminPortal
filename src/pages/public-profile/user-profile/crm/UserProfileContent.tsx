import { Booking } from "./blocks/Booking";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";
import { Deposit } from "./blocks/Deposit";
import { Statistics } from "./blocks/Statistics";

interface UserProfileContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  // handleBookingNum: (num: any) => void;
  searchInput?: string;
  id: any;
  activeTab: string;
  // coorData: any;
}

const UserProfileContent = ({
  isAddOpen,
  _handleAddOpen,
  searchInput,
  id,
  activeTab,
}: UserProfileContentProps) => {
  // console.log("coor", coorData);
  // const items: any = [
  //   // { number: coorData?.currentCredit, label: "Current Credit" },
  //   // { number: coorData?.creditLimit, label: "Credit Limit" },
  //   // { number: "369M", label: "Revenue" },
  //   // { number: "27", label: "Company Rank" },
  // ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
      {/* <div className="col-span-1 lg:col-span-3">
        <Statistics items={items} />
      </div> */}
      <div className="col-span-1 lg:col-span-3">
        <Booking
          _handleAddOpen={_handleAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          id={id}
        />
      </div>
      {/* <div className="col-span-1 lg:col-span-3">
        {activeTab === "bookings" ? (
        ) : (
          <Deposit
            _handleAddOpen={_handleAddOpen}
            isAddOpen={isAddOpen}
            searchInput={searchInput}
            id={id}
          />
        )} */}
      {/* </div> */}
    </div>
  );
};

// export { BookingContent };

export { UserProfileContent };
