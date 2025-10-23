import React, { forwardRef, Fragment } from "react";
import { Link } from "react-router-dom";
import { useDemo1Layout } from "../";
import { toAbsoluteUrl } from "@/utils";
import { SidebarToggle } from "./";
import logoOpened from "@/media/images/logo-opened.png";
import logoClosed from "@/media/images/logo-closed.png";

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout } = useDemo1Layout();

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        <img
          src={logoOpened}
          className="default-logo min-h-[40px] max-w-[150px] object-contain translate-x-1/3"
          alt="Logo"
        />
        <img
          src={logoClosed}
          className="small-logo min-h-[40px] max-w-[40px] object-contain"
          alt="Logo"
        />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img
          src={logoOpened}
          className="default-logo min-h-[40px] max-w-[150px] object-contain"
          alt="Logo"
        />
        <img
          src={logoClosed}
          className="small-logo min-h-[40px] max-w-[40px] object-contain"
          alt="Logo"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      <img
        src={logoOpened}
        className="default-logo min-h-[40px] max-w-[150px] object-contain"
        alt="Logo"
      />
      <img
        src={logoClosed}
        className="small-logo min-h-[40px] max-w-[40px] object-contain"
        alt="Logo"
      />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
    >
      {layout.options.sidebar.theme === "light" ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
