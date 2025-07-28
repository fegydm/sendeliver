// File: src/apps/hauler/hauler.page.tsx
// Last change: Migrated from pages/ with corrected imports and updated structure

import React, { useState, useEffect } from "react";
import HaulerTabs from "./hauler.tabs";
import PinForm from "@/components/shared/elements/pin-form.element";
import "./hauler.page.css";

/**
 * HaulerPage now relies on global auth and idle logic managed in App.tsx.
 * Unified authentication and idle logic in App component.
 */
const HaulerPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    localStorage.getItem("authenticated") === "true"
  );

  // Track current active tab for HaulerComponent
  const [activeTab, setActiveTab] = useState<string>("panel");

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

  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    setIsAuthenticated(false);
  };

  // Show PIN form overlay if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="hauler-page">
        <div className="hauler-page__overlay">
          <PinForm domain="hauler" onCorrectPin={handleCorrectPin} />
        </div>
      </div>
    );
  }

  // Authenticated → render HaulerComponent with props
  return (
    <div className="hauler-page">
      <HaulerTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        role="hauler" 
      />
    </div>
  );
};

export { HaulerPage };
export default HaulerPage;