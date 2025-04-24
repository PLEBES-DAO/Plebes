import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./AuthPlug.jsx";
import './buffer-polyfill.js';
import { MetaMaskProvider } from "metamask-react";
import { BrowserRouter } from "react-router-dom";
import BioniqContextProvider from "./hooks/BioniqContext.jsx";
import "swiper/css";
// import "swiper/css/pagination";
import "tippy.js/dist/tippy.css";
import "react-modal-video/css/modal-video.css";
// The Buffer and process imports are now handled by vite-plugin-node-polyfills

if (typeof window !== "undefined") {
  // Import the script only on the client side
  import("bootstrap/dist/js/bootstrap.esm").then((module) => {
    // Module is imported, you can access any exported functionality if
  });
}

// These globals are automatically provided by vite-plugin-node-polyfills
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
