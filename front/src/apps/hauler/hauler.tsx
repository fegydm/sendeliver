// File: front/src/apps/hauler/hauler.tsx
// Last change: Integrated GeneralModal with refactored PinForm

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@sendeliver/logger";
import HaulerTabs from "./tabs.hauler";
import GeneralModal from "@/shared/modals/general.modal";
import PinForm from "@/shared/elements/pin-form.element";
import { Button } from "@/shared/ui/button.ui";
import "./hauler.css";

// This interface can be moved to a shared types file
interface DeviceInfo {
  userAgent: string;
  language: string;
  screenSize: string;
  timeZone: string;
  platform: string;
  doNotTrack: string | null;
  cookieEnabled: boolean;
  typingPattern: number[];
}

const Hauler: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    localStorage.getItem("authenticated") === "true"
  );
  const [activeTab, setActiveTab] = useState<string>("panel");
  const navigate = useNavigate();

  // This state now controls the GeneralModal
  const [isPinModalOpen, setIsPinModalOpen] = useState(!isAuthenticated);

  useEffect(() => {
    const authStatus = localStorage.getItem("authenticated") === "true";
    setIsAuthenticated(authStatus);
    setIsPinModalOpen(!authStatus);

    const handleStorage = () => {
      const newAuthStatus = localStorage.getItem("authenticated") === "true";
      setIsAuthenticated(newAuthStatus);
      setIsPinModalOpen(!newAuthStatus);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // The verification logic now lives in the parent component
  const handlePinVerification = async (pin: string, deviceInfo: DeviceInfo): Promise<boolean> => {
    try {
      logger.info(`PIN verification attempt`, { domain: "hauler", deviceInfo });
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain: "hauler", pin, deviceInfo }),
      });
      
      const body = await res.json();
      
      if (body.success) {
        logger.info(`PIN verification successful`, { domain: "hauler" });
        localStorage.setItem("authenticated", "true");
        setIsAuthenticated(true);
        setIsPinModalOpen(false); // Close modal on success
        return true;
      }
      return false;
    } catch (err) {
      logger.error("Error during PIN verification API call", { error: err });
      return false;
    }
  };

  // The main page is always rendered, the modal is rendered on top of it
  return (
    <div className="hauler">
      <HaulerTabs activeTab={activeTab} setActiveTab={setActiveTab} role="hauler" />

      <GeneralModal
        isOpen={isPinModalOpen}
        onClose={() => navigate("/")} // Closing the PIN form takes the user home
        title="Enter PIN"
        description="Please enter your 4-digit PIN to access the hauler dashboard."
        actions={
          <Button variant="link" onClick={() => navigate("/")}>
            Back to Home Page
          </Button>
        }
      >
        <PinForm onVerify={handlePinVerification} />
      </GeneralModal>
    </div>
  );
};

export default Hauler;
