// File: ./front/src/components/sections/footers/footer-page.component.tsx
// Last change: Optimized footer test rendering

import React, { useState } from "react";
import FooterSocial from "./FooterSocial";
import FooterMenu from "./FooterMenu";
import FooterCopyright from "./FooterCopyright";
import PinModal from "@/components/modals/pin-modal.component";
import FooterTest from "@/components/sections/footers/footer-test.component";
import { useTestFooter } from "@/lib/test-footer-context";

interface FooterPageProps {
    onPinVerified?: (isAccessible: boolean) => void;
}

const FooterPage: React.FC<FooterPageProps> = ({ onPinVerified }) => {
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const { isTestFooterVisible, setTestFooterVisible } = useTestFooter();
    const isDevMode = process.env.NODE_ENV === "development";

    const handleButtonClick = () => {
        if (isTestFooterVisible) {
            setTestFooterVisible(false);
            onPinVerified?.(false);
        } else {
            setIsPinModalOpen(true);
        }
    };

    const handlePinSuccess = () => {
        setTestFooterVisible(true);
        onPinVerified?.(true);
        setIsPinModalOpen(false);
    };

    return (
        <footer className="page-footer">
            <div className="footer-social">
                <FooterSocial />
            </div>

            <div className="footer-row">
                <FooterMenu />
                <FooterCopyright />
            </div>

            <button
                onClick={handleButtonClick}
                aria-label={isTestFooterVisible ? "Close Access" : "Admin Access"}
                className={`admin-button ${!isTestFooterVisible && process.env.NODE_ENV === "production" ? "transparent-text" : ""}`}
            >
                {isTestFooterVisible ? "Close" : "Administrator"}
            </button>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                requiredPin="4545"
                onPinSuccess={handlePinSuccess}
            />

            {isDevMode && <FooterTest />}
        </footer>
    );
};

export default FooterPage;