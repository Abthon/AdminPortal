import { Fragment } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import { UserProfileHero } from "@/partials/heros";
import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";

import { ReportContent } from ".";

const ReportPage = () => {
  return (
    <Fragment>
      <Container>
        <button
          onClick={() => window.history.back()}
          className="flex text-gray-600 hover:text-gray-900 mr-4 mb-4 pb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {/* Back */}
        </button>
      </Container>

      <Container>
        <ReportContent />
      </Container>
    </Fragment>
  );
};

export { ReportPage };
