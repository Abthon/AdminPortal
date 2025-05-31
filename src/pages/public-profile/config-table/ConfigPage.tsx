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
import { ConfigContent } from ".";
import { useLayout } from "@/providers";
import { KeenIcon } from "@/components";

const ConfigPage = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [configNum, setConfigNum] = useState(null);
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
                    All Configurations:
                  </span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {configNum}
                  </span>
                </div>
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <>{/* Search input moved to table header */}</>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <ConfigContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          handleConfigNum={setConfigNum}
        />
      </Container>
    </Fragment>
  );
};

export { ConfigPage };
