// ./front/src/components/sections/footers/page-footer.component.tsx
import React, { useState } from "react";
import FooterSocial from "./FooterSocial";
import FooterMenu from "./FooterMenu";
import FooterCopyright from "./FooterCopyright";
import PinModal from "@/components/modals/pin-modal.component";
import logicConfig from "@/configs/logic-config.json";

interface PageFooterProps {
  onPinVerified?: () => void;
}

const PageFooter: React.FC<PageFooterProps> = ({ onPinVerified }) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);

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

      {/* Admin Button - visible in all modes */}
      {!isPinVerified && (
        <button
          onClick={() => setIsPinModalOpen(true)}
          aria-label="Admin Access"
          className="admin-button"
        >
          Administrator
        </button>
      )}

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        requiredPin={logicConfig.pins.admin}
        onPinSuccess={() => {
          setIsPinVerified(true);
          setIsPinModalOpen(false);
          onPinVerified?.();
        }}
      />
    </footer>
  );
};

export default PageFooter;
