// ./front/src/components/sections/footers/page-footer.component.tsx
import React, { useState } from "react";
import SocialLinks from "./SocialLinks";
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

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <footer className="relative w-full bg-footer-light dark:bg-footer-dark text-footer-light dark:text-footer-dark py-4">
      <div className="max-w-content mx-auto px-container">
        {/* Social Links at the top */}
        <div className="text-center mb-4">
          <SocialLinks />
        </div>

        {/* Footer copyright and menu */}
        <div className="flex justify-between items-center">
          <FooterCopyright />
          <FooterMenu />
        </div>

        {/* Hidden Admin Link - only in production */}
        {!isDevelopment && !isPinVerified && (
          <button
            onClick={() => setIsPinModalOpen(true)}
            aria-label="Admin Access"
            className="absolute bottom-2 left-2 text-transparent focus:outline-none"
          >
            Administrator
          </button>
        )}

        {/* PIN Modal - only in production */}
        {!isDevelopment && (
          <PinModal
            isOpen={isPinModalOpen}
            onClose={() => setIsPinModalOpen(false)}
            requiredPin={logicConfig.pins.admin}
            onPinSuccess={() => {
              setIsPinVerified(true);
              setIsPinModalOpen(false);
              onPinVerified?.(); // Volať callback po úspešnej verifikácii
            }}
          />
        )}
      </div>
    </footer>
  );
};

export default PageFooter;
