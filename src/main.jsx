import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./AuthPlug.jsx";
import { Buffer } from "buffer/";
import { MetaMaskProvider } from "metamask-react";
import { BrowserRouter } from "react-router-dom";
import "swiper/css";
// import "swiper/css/pagination";
import "tippy.js/dist/tippy.css";
import "react-modal-video/css/modal-video.css";
if (typeof window !== "undefined") {
  // Import the script only on the client side
  import("bootstrap/dist/js/bootstrap.esm").then((module) => {
    // Module is imported, you can access any exported functionality if
  });
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <MetaMaskProvider>
          <App />
        </MetaMaskProvider>
      </BrowserRouter>
    </AuthProvider>
    ,
  </React.StrictMode>
);
