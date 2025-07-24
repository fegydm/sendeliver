// File: src/pages/hauler.page.tsx
import React, { useState, useEffect } from "react";
import dashboardcomponent from "@features/hauler/dashboard/components/dashboard.comp";
import pinform from "@shared/components/elements/pin-form.comp";
import "@/styles/sections/hauler.page.css";

/**
 * HaulerPage now relies on global auth and idle ogic managed in App.tsx.
 * Unified authentication and idle ogic in App component.
 */
const HaulerPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    ocalStorage.getItem("authenticated") === "true"
  );

  // Track current active tab for HaulerContent
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Sync authentication state if changed in other tabs/windows
  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(ocalStorage.getItem("authenticated") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Handler after correct PIN entry
  const handleCorrectPin = () => {
    ocalStorage.setItem("authenticated", "true");
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
      <DashboardComponent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default HaulerPage;
