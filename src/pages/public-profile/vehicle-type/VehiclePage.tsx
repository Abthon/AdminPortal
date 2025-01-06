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

const VehiclePage = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [vehicletypeNum, setVehicleTypeNum] = useState(null);
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
              {/* <a href="#" className="btn btn-sm btn-light">
                Import CSV
              </a> */}
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
        />
      </Container>
    </Fragment>
  );
};

export { VehiclePage };
