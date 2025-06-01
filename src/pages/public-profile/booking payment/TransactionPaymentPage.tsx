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
                    placeholder="Search By Description"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </label>
              </div>

              <span
                onClick={() => setActiveTab("all")}
                className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-light"}`}
              >
                All Transactions
              </span>
              {/* <span
                onClick={() => setActiveTab("deduct")}
                className={`btn btn-sm ${activeTab === "deduct" ? "btn-primary" : "btn-light"}`}
              >
                Deductions
              </span>
              <span
                onClick={() => setActiveTab("add")}
                className={`btn btn-sm ${activeTab === "add" ? "btn-primary" : "btn-light"}`}
              >
                Additions
              </span>
              <span
                onClick={() => setActiveTab("pending")}
                className={`btn btn-sm ${activeTab === "pending" ? "btn-primary" : "btn-light"}`}
              >
                Pending
              </span> */}

              {/* Optional: Add Transaction button */}
              {/* <button
                onClick={() => {
                  setIsAddOpen((open) => !open);
                }}
                className="btn btn-sm btn-primary"
              >
                Add Transaction
              </button> */}
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
