// ./front/src/components/sections/footers/page-footer.component.tsx
import React, { useState } from "react";
import FooterSocial from "./FooterSocial";
import FooterMenu from "./FooterMenu";
import FooterCopyright from "./FooterCopyright";
import PinModal from "@/components/modals/pin-modal.component";
import logicConfig from "@/configs/logic-config.json";

interface PageFooterProps {
  onPinVerified?: (isAccessible: boolean) => void;
}

const PageFooter: React.FC<PageFooterProps> = ({ onPinVerified }) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);

  const handleButtonClick = () => {
    if (isPinVerified) {
      // Reset state to make TestFooter inaccessible
      setIsPinVerified(false);
      onPinVerified?.(false); // Notify parent to disable TestFooter
    } else {
      // Open PIN modal
      setIsPinModalOpen(true);
    }
  };

  return (
    <footer className="page-footer">
      {/* Center social links */}
      <div className="footer-social">
        <FooterSocial />
      </div>

      {/* Menu and copyright in one row */}
      <div className="footer-row">
        <FooterMenu />
        <FooterCopyright />
      </div>

      {/* Admin Button */}
      <button
        onClick={handleButtonClick}
        aria-label={isPinVerified ? "Close Access" : "Admin Access"}
        className={`admin-button ${process.env.NODE_ENV === "production" && !isPinVerified ? "transparent-text" : ""}`}
      >
        {isPinVerified ? "Close" : "Administrator"}
      </button>

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        requiredPin={logicConfig.pins.admin}
        onPinSuccess={() => {
          setIsPinVerified(true); // Show "Close" button
          setIsPinModalOpen(false);
          onPinVerified?.(true); // Notify parent to enable TestFooter
        }}
      />
    </footer>
  );
};

export default PageFooter;
