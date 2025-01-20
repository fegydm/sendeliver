// File: front/src/components/sections/footers/footer-test.component.tsx

import React, { useState } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";
import { themeDefaults } from "@/constants/theme-defaults";

interface FooterTestProps {
  isVisible: boolean; // Visibility prop
  onClose: () => void; // Callback to close FooterTest
}

const FooterTest: React.FC<FooterTestProps> = ({ isVisible, onClose }) => {
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  if (!isVisible) return null; // Hide if not visible

  return (
    <footer className="footer__test">
      <div className="footer__test-container">
        {/* Left Section */}
        <div className="footer__test-left">
          <ThemeSwitcher is3DMode={is3DMode} />
          <Button
            variant="secondary"
            onClick={() => setIs3DMode((prev) => !prev)}
          >
            {is3DMode ? "Switch to 2D" : "Switch to 3D"}
          </Button>
        </div>

        {/* Right Section */}
        <div className="footer__test-right">
          <Button variant="secondary" onClick={() => setIsThemeEditorOpen(true)}>
            Theme Editor
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsColorPaletteOpen(true)}
          >
            Color Palette
          </Button>
        </div>

        {/* Modals */}
        <ThemeEditorModal
          isOpen={isThemeEditorOpen}
          onClose={() => setIsThemeEditorOpen(false)}
          onSave={(data) => console.log("Saved theme data:", data)}
          editorData={themeDefaults}
        />
        <ColorPaletteModal
          isOpen={isColorPaletteOpen}
          onClose={() => setIsColorPaletteOpen(false)}
        />

        {/* Close Button */}
        <Button variant="primary" onClick={onClose} className="footer__test-close">
          Close
        </Button>
      </div>
    </footer>
  );
};

export default FooterTest;
