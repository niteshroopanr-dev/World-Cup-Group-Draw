import "./storage-shim.js";
import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { LangProvider } from "./i18n.jsx";
import WorldCupFamilyDraw from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <WorldCupFamilyDraw />
    </LangProvider>
    <Analytics />
  </React.StrictMode>
);
