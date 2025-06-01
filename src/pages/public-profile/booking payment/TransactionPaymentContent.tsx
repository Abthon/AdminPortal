import { Transaction } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface TransactionPaymentContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleTransactionNum: (num: any) => void;
  searchInput?: string;
  activeTab?: string;
}

const TransactionPaymentContent = ({
  isAddOpen,
  _handleAddOpen,
  handleTransactionNum,
  searchInput,
  activeTab,
}: TransactionPaymentContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Transaction
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleTransactionNum={handleTransactionNum}
        activeTab={activeTab}
      />
    </div>
  );
};

export { TransactionPaymentContent };
