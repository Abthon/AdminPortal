import { Quotes } from "./blocks";

interface QuoteContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (isOpen: boolean) => void;
  handleQuoteCount: (num: any) => void;
  searchInput?: string;
}

const QuoteContent = ({
  isAddOpen,
  _handleAddOpen,
  handleQuoteCount,
  searchInput,
}: QuoteContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Quotes
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleQuoteCount={handleQuoteCount}
      />
    </div>
  );
};

export { QuoteContent };
