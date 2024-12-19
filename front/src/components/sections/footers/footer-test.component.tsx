// ./front/src/components/sections/footers/TestFooter.tsx
import React, { useState } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";

const TestFooter: React.FC = () => {
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  return (
    <footer className="test-footer">
      <div className="footer-container">
        {/* ThemeSwitcher left */}
        <div className="footer-left">
          <ThemeSwitcher />
        </div>

        {/* Modal buttons right */}
        <div className="footer-right">
          <Button
            variant="secondary"
            onClick={() => setIsThemeEditorOpen(true)}
          >
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
          editorData={{}}
          onSave={() => {
            console.log("Save clicked");
          }}
        />
        <ColorPaletteModal
          isOpen={isColorPaletteOpen}
          onClose={() => setIsColorPaletteOpen(false)}
        />
      </div>
    </footer>
  );
};

export default TestFooter;
