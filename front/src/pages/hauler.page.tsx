// File: front/src/pages/hauler.page.tsx
// Last change: Fixed PinForm props and timer typing

import React, { useState, useEffect } from "react";
import HaulerContent from "@/components/hauler/content/hauler.content.component";
import PinForm from "@/components/shared/elements/pin-form.element";
import "@/styles/sections/hauler.page.css";

const HaulerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isPinVerified, setIsPinVerified] = useState<boolean>(() =>
    localStorage.getItem("pin-hauler-verified") === "true"
  );

  // When PIN is verified, store flag and set up auto-logout
  useEffect(() => {
    let timerId: number | undefined;
    if (isPinVerified) {
      // store verification in localStorage
      localStorage.setItem("pin-hauler-verified", "true");

      // schedule auto-logout in 1 minute
      timerId = window.setTimeout(() => {
        localStorage.removeItem("pin-hauler-verified");
        setIsPinVerified(false);
      }, 60_000);
    }
    return () => {
      // clear timeout if it was set
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
    };
  }, [isPinVerified]);

  // If not yet verified, show only PinForm
  if (!isPinVerified) {
    return (
      <div className="hauler-page__overlay">
        <PinForm
          domain="hauler"                  
          onCorrectPin={() => setIsPinVerified(true)}
        />
      </div>
    );
  }

  // PIN verified → render full content
  return (
    <div className="hauler-page">
      <HaulerContent activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Under construction only for billing tab */}
      {activeTab === "billing" && (
        <div className="under-construction">Vyberte sekciu</div>
      )}
    </div>
  );
};

export default HaulerPage;
