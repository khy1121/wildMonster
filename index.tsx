import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

console.log("ENTRY LOADED");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ENTRY ERROR: Could not find #root element");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("ENTRY MOUNT ERROR", err);
  }
}
