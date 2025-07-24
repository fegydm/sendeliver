// File: ./front/src/main.tsx
// Last change: Added filter to hide React Router Future Flag warnings in dev mode

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@/shared/styles/main.css";

// Filter out specific React Router warnings in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn.bind(console); // 

  console.warn = function (...args) {
    const isReactRouterWarning = args.some(
      (arg) =>
        typeof arg === "string" &&
        arg.includes("React Router Future Flag Warning")
    );
    if (!isReactRouterWarning) {
      originalWarn(...args); // 
    }
  };
}

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
