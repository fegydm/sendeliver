// File: src/pages/hauler.page.tsx
import React, { useState, useEffect } from "react";
import HaulerContent from "@/components/hauler/hauler.tabs.component";
import PinForm from "@/components/shared/elements/pin-form.element";
import "@/styles/sections/hauler.page.css";

/**
 * HaulerPage now relies on global auth and idle logic managed in App.tsx.
 * Unified authentication and idle logic in App component.
 */
const HaulerPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    localStorage.getItem("authenticated") === "true"
  );

  // Track current active tab for HaulerContent
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Sync authentication state if changed in other tabs/windows
  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(localStorage.getItem("authenticated") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Handler after correct PIN entry
  const handleCorrectPin = () => {
    localStorage.setItem("authenticated", "true");
    setIsAuthenticated(true);
  };

  // Show PIN form overlay if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="hauler-page__overlay">
        <PinForm domain="hauler" onCorrectPin={handleCorrectPin} />
      </div>
    );
  }

  // Authenticated → render HaulerContent with props
  return (
    <div className="hauler-page">
      <HaulerContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default HaulerPage;
