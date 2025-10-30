import { Matches } from "./blocks";

interface MatchContentProps {
  handleMatchNum: (num: any) => void;
  searchInput?: string;
}

const MatchContent = ({
  handleMatchNum,
  searchInput,
}: MatchContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Matches
        searchInput={searchInput}
        handleMatchNum={handleMatchNum}
      />
    </div>
  );
};

export { MatchContent };