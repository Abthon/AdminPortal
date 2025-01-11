import { Fragment, useState } from "react";

import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";

import { CoorporateContent } from ".";
import { useLayout } from "@/providers";
import { KeenIcon } from "@/components";

const CoorporatePage = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [coorporateNum, setCoorporateNum] = useState<number | null>(null);
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
                  <span className="text-md text-gray-700">All Coors:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {coorporateNum}
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
                    placeholder="Search Coorporate"
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
                Add Corporate
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <CoorporateContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          searchInput={searchInput}
          handleCoorporateNum={setCoorporateNum}
        />
      </Container>
    </Fragment>
  );
};

export { CoorporatePage };
