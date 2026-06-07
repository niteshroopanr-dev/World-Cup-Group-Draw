import "./storage-shim.js";
import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import WorldCupFamilyDraw from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WorldCupFamilyDraw />
    <Analytics />
  </React.StrictMode>
);
