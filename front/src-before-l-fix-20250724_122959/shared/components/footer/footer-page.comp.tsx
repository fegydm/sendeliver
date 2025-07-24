// File: src/shared/components/footer/footer-page.comp.tsx

import React, { useState } from "react";

import footersocial from "@/components/shared/footers/footersocial";
import footercopyright from "@/components/shared/footers/footercopyright";
import footermenu from "@/components/shared/footers/footermenu";

import pinmodal from "@/components/modals/pin-modal.comp";

interface FooterPageProps {
  onAdminToggle: (isVisible: boolean) => void;
  isTestFooterVisible: boolean; // Tracks visibility state of test footer
}

const FooterPage: React.FC<footerPageProps> = ({ onAdminToggle, isTestFooterVisible }) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleAdminAccess = (granted: boolean) => {
    onAdminToggle(granted); // Update FooterTest visibility
    setIsPinModalOpen(false); // Close the modal
    if (granted) {
      localStorage.setItem("isTestFooterVisible", "true");
    } else {
      localStorage.removeItem("isTestFooterVisible");
    }
  };

  return (
    <div className="footer__page">
      {/* Social Section */}
      <div className="footer__social">
        <FooterSocial />
      </div>

      {/* Menu and Copyright Section */}
      <div className="footer__row">
        <FooterCopyright />
        <FooterMenu />
      </div>

      {/* Admin Button */}
      <button
        className="footer__admin-button"
        onClick={() => {
          if (isTestFooterVisible) {
            handleAdminAccess(false); // Close FooterTest directly
          } else {
            setIsPinModalOpen(true); // Open PIN modal
          }
        }}
        aria-label={isTestFooterVisible ? "Close Test Footer" : "Admin Access"}
      >
        {isTestFooterVisible ? "Close" : "Administrator"}
      </button>

      {/* Pin Modal */}
      {isPinModalOpen && (
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          requiredPin="1221"  // Updated required PIN to "1221"
          onPinSuccess={() => handleAdminAccess(true)}
        />
      )}
    </div>
  );
};

export default FooterPage;
