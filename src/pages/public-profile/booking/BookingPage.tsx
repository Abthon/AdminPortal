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
import { BookingContent } from ".";
import { useLayout } from "@/providers";
import { KeenIcon } from "@/components";

const BookingPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [bookingNum, setBookingNum] = useState(null);
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
                    placeholder="Search By ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </label>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen((open) => !open);
                }}
                className="btn btn-sm btn-primary"
              >
                Add Booking
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <BookingContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          handleBookingNum={setBookingNum}
          searchInput={searchInput}
        />
      </Container>
    </Fragment>
  );
};

export { BookingPage };
