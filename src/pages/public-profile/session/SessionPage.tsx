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
import { SessionContent } from ".";
import { useLayout } from "@/providers";

const SessionPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [sessionNum, setSessionNum] = useState(null);
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
                  <span className="text-md text-gray-700">All Sessions:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {sessionNum}
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
                    placeholder="Search sessions"
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
                Add Session
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <SessionContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          handleSessionNum={setSessionNum}
        />
      </Container>
    </Fragment>
  );
};

export { SessionPage };
