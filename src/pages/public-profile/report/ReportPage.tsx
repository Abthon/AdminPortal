import { Fragment } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import { UserProfileHero } from "@/partials/heros";
import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";

import { ReportContent } from ".";

const ReportPage = () => {
  const image = (
    <img
      src={toAbsoluteUrl("/media/avatars/300-1.png")}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );

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
