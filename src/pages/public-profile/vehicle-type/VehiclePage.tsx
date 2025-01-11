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
import { VehicleContent } from ".";
import { useLayout } from "@/providers";
import { KeenIcon } from "@/components";

const VehiclePage = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [vehicletypeNum, setVehicleTypeNum] = useState(null);
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
                  <span className="text-md text-gray-700">
                    All Vehicle Types:
                  </span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {vehicletypeNum}
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
                    placeholder="Search By Name"
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
                Add Vehicle Type
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <VehicleContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          handleVehicleTypeNum={setVehicleTypeNum}
          searchInput={searchInput}
        />
      </Container>
    </Fragment>
  );
};

export { VehiclePage };
