import { Transactions } from "./blocks";

interface TransactionContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleTransactionNum: (num: any) => void;
  searchInput?: string;
}

const TransactionContent = ({
  isAddOpen,
  _handleAddOpen,
  handleTransactionNum,
  searchInput,
}: TransactionContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Transactions
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleTransactionNum={handleTransactionNum}
      />
    </div>
  );
};

export { TransactionContent };
