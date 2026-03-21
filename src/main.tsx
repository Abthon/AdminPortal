import "@/components/keenicons/assets/styles.css";
import "./styles/globals.css";

import axios from "axios";
import ReactDOM from "react-dom/client";

import { App } from "./App";
// import { ProvidersWrapper } from "./providers";
import React from "react";
// import { setupAxios } from "./auth";

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
// setupAxios(axios);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <ProvidersWrapper> */}
    {/* <App /> */}
    <div className="flex justify-center items-center h-screen text-center">
      Admin Portal is Down currently
    </div>
    {/* </ProvidersWrapper> */}
  </React.StrictMode>
);