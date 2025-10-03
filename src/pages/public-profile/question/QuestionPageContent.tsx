import { Question } from "./blocks";
import { MiscFaq, MiscHelp2 } from "@/partials/misc";

interface QuestionPageContentProps {
  isAddOpen: boolean;
  _handleAddOpen: (open: boolean) => void;
  handleQuestionNum: (num: any) => void;
  searchInput?: string;
}

const QuestionPageContent = ({
  isAddOpen,
  _handleAddOpen,
  handleQuestionNum,
  searchInput,
}: QuestionPageContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Question
        _handleAddOpen={_handleAddOpen}
        isAddOpen={isAddOpen}
        searchInput={searchInput}
        handleQuestionNum={handleQuestionNum}
      />
    </div>
  );
};

export { QuestionPageContent };
