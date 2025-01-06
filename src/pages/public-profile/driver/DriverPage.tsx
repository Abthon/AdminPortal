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
import { DriverContent } from ".";
import { useLayout } from "@/providers";

const DriverPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [driverNum, setDriverNum] = useState(null);
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
                  <span className="text-md text-gray-700">All Drivers:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {driverNum}
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
                Add Driver
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <DriverContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          handleDriverNum={setDriverNum}
        />
      </Container>
    </Fragment>
  );
};

export { DriverPage };
