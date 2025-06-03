import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { TransactionPaymentContent } from ".";
import { useLayout } from "@/providers";
import { KeenIcon } from "@/components";

const TransactionPaymentPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionNum, setTransactionNum] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
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
                    All Transactions:
                  </span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {transactionNum}
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
                    placeholder="Search By Driver Id"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </label>
              </div>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <TransactionPaymentContent
          _handleAddOpen={setIsAddOpen}
          isAddOpen={isAddOpen}
          handleTransactionNum={setTransactionNum}
          searchInput={searchInput}
          activeTab={activeTab}
        />
      </Container>
    </Fragment>
  );
};

export { TransactionPaymentPage };
