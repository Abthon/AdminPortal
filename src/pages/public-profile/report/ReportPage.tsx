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
        <h1 className="text-xl font-medium leading-none text-gray-900 mb-6 pl-2">
          Report
        </h1>
        <Navbar>
          <PageMenu />
        </Navbar>
      </Container>

      <Container>
        <ReportContent />
      </Container>
    </Fragment>
  );
};

export { ReportPage };
