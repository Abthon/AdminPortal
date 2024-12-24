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
import { VehicleTableContent } from ".";
import { useLayout } from "@/providers";

const VechileRegistrationPage = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
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
                  <span className="text-md text-gray-700">All Members:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    49,053
                  </span>
                </div>
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <a href="#" className="btn btn-sm btn-light">
                Import CSV
              </a>
              <button
                onClick={() => {
                  setIsAddOpen((open) => !open);
                }}
                className="btn btn-sm btn-primary"
              >
                Add Vehicle
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <VehicleTableContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
        />
      </Container>
    </Fragment>
  );
};

export { VechileRegistrationPage };