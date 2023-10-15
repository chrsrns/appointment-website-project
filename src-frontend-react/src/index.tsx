import { createRoot } from "react-dom/client";

import "./index.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { CookiesProvider } from "react-cookie";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./global.js";

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

root.render(
  <GoogleOAuthProvider clientId="703649575342-u1ol3db09ssh3puafl6c8mqd8ht12snm.apps.googleusercontent.com">
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </GoogleOAuthProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
