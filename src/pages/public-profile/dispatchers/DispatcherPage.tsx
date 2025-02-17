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
import { DispatcherContent } from ".";
import { useLayout } from "@/providers";

const DispatcherPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dispatcherNum, setDispatcherNum] = useState(null);
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
                  <span className="text-md text-gray-700">All Dispatchers:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {dispatcherNum}
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
                    placeholder="Search Dispatcher"
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
                Add Dispatcher
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <DispatcherContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          handleDispatcherNum={setDispatcherNum}
        />
      </Container>
    </Fragment>
  );
};

export { DispatcherPage };
