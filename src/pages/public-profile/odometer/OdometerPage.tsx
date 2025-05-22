import { Fragment, useState } from "react";

import { Container } from "@/components/container";
import { KeenIcon } from "@/components";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";

//NetworkUserTableTeamCrewContent
import { OdometerPageContent } from ".";
import { useLayout } from "@/providers";

const OdometerPage = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [vehicleNum, setVehicleNum] = useState(null);
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
                  <span className="text-md text-gray-700">All Odometer:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {vehicleNum}
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
                    placeholder="Search By Plate Number"
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
                Add Odometer
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <OdometerPageContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          handleVehicleNum={setVehicleNum}
        />
      </Container>
    </Fragment>
  );
};

export { OdometerPage };
