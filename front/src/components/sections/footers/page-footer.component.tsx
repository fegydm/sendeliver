// front/src/components/footers/page-footer.component.tsx
import React, { useState } from "react";
import SocialLinks from "./SocialLinks";
import FooterMenu from "./FooterMenu";
import ColorPaletteModalTrigger from "./ColorPaletteModalTrigger";
import FooterCopyright from "./FooterCopyright";
import ThemeSwitcher from "@/components/ui/theme-switcher.component";
import ThemeEditorModal from "@/components/modals/theme-editor-modal.component";

const PageFooter: React.FC = () => {
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);

  return (
    <footer className="relative w-full bg-footer-light dark:bg-footer-dark text-footer-light dark:text-footer-dark py-4">
      <div className="max-w-content mx-auto px-container">
        {/* Top Row: Social Links */}
        <div className="flex justify-between items-center mb-4">
          <SocialLinks />
          <div className="flex items-center gap-4">
            <ColorPaletteModalTrigger />
            <button
              onClick={() => setIsThemeEditorOpen(true)}
              className="text-sm hover:underline"
            >
              Theme Editor
            </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center">
          <FooterCopyright />
          <FooterMenu />
        </div>

        {/* Theme Switcher */}
        <div className="mt-6">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Theme Editor Modal */}
      <ThemeEditorModal
        isOpen={isThemeEditorOpen}
        onClose={() => setIsThemeEditorOpen(false)}
      />
    </footer>
  );
};

export default PageFooter;
