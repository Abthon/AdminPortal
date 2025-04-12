import { Fragment, useState } from "react";

import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";

//NetworkUserTableTeamCrewContent
import { BookingPaymentContent } from ".";
import { useLayout } from "@/providers";
import { KeenIcon } from "@/components";

const BookingPaymentPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [bookingNum, setBookingNum] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [searchInput, setSearchInput] = useState("");
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      {currentLayout?.name === "demo1-layout" && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                <div className="flex items-center flex-wrap gap-1.5 font-medium">
                  <span className="text-md text-gray-700">All Bookings:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {bookingNum}
                  </span>
                </div>
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <div className="flex">
                <label className="input input-sm">
                  <KeenIcon icon="magnifier" />
                  <input
                    type="text"
                    placeholder="Search By Pick up name"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </label>
              </div>

              <span
                onClick={() => setActiveTab("bookings")}
                className="btn btn-sm btn-light"
              >
                All Bookings
              </span>
              <span
                onClick={() => setActiveTab("cash")}
                className="btn btn-sm btn-light"
              >
                Cashes
              </span>
              <span
                onClick={() => setActiveTab("invoice")}
                className="btn btn-sm btn-light"
              >
                Invoices
              </span>

              {/* <button
                onClick={() => {
                  setIsAddOpen((open) => !open);
                }}
                className="btn btn-sm btn-primary"
              >
                Add Booking
              </button> */}
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <BookingPaymentContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          handleBookingNum={setBookingNum}
          searchInput={searchInput}
          activeTab={activeTab}
        />
      </Container>
    </Fragment>
  );
};

export { BookingPaymentPage };
