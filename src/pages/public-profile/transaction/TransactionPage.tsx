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
import { TransactionContent } from ".";
import { SubscriptionManagement } from "./blocks/SubscriptionManagement";
import { useLayout } from "@/providers";

const TransactionPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionNum, setTransactionNum] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<"transactions" | "subscriptions">("transactions");
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
                  <span className="text-md text-gray-700">All Transactions:</span>
                  <span className="text-md text-gray-800 font-medium me-2">
                    {transactionNum}
                  </span>
                </div>
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <div className="flex items-center gap-2">
                {/* Search Box */}
                <label className="input input-sm">
                  <KeenIcon icon="magnifier" />
                  <input
                    type="text"
                    placeholder={activeTab === "transactions" ? "Search transactions" : "Search subscriptions"}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </label>
              </div>
              {/*<button
                onClick={() => {
                  setIsAddOpen((open) => !open);
                }}
                className="btn btn-sm btn-primary"
                disabled={true}
              >
                Export Data
              </button>*/}

              {/* Tab Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "transactions"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("subscriptions")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "subscriptions"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Subscriptions
                </button>
              </div>
            </ToolbarActions>
          </Toolbar>
          
          {/* Conditional Content Based on Active Tab */}
          {activeTab === "transactions" ? (
            <TransactionContent
              _handleAddOpen={setIsAddOpen}
              isAddOpen={isAddOpen}
              handleTransactionNum={setTransactionNum}
              searchInput={searchInput}
            />
          ) : (
            <div className="grid gap-5 lg:gap-7.5">
              <SubscriptionManagement searchInput={searchInput} />
            </div>
          )}
        </Container>
      )}
    </Fragment>
  );
};

export { TransactionPage };