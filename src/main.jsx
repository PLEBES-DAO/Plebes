import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./AuthPlug.jsx";
import { MetaMaskProvider } from "metamask-react";
import { BrowserRouter } from "react-router-dom";
import BioniqContextProvider from "./hooks/BioniqContext.jsx";
import "swiper/css";
// import "swiper/css/pagination";
import "tippy.js/dist/tippy.css";
import "react-modal-video/css/modal-video.css";
import { Buffer } from 'buffer/'

if (typeof window !== "undefined") {
  // Import the script only on the client side
  import("bootstrap/dist/js/bootstrap.esm").then((module) => {
    // Module is imported, you can access any exported functionality if
  });
}
globalThis.Buffer = Buffer

import process from 'process/browser';

window.Buffer = Buffer;
window.process = process;
// init.js
window.global ||= window;


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <BrowserRouter>
        <MetaMaskProvider>
          <BioniqContextProvider>
            <App />
          </BioniqContextProvider>
        </MetaMaskProvider>
      </BrowserRouter>
    ,
  </React.StrictMode>
);
