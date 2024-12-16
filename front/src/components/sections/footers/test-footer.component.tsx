import React, { useState } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";

const TestFooter: React.FC = () => {
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4">
      <div className="max-w-content mx-auto px-container flex justify-between items-center">
        {/* ThemeSwitcher left */}
        <div className="flex gap-2 items-center">
          <ThemeSwitcher />
        </div>

        {/* Modal right */}
        <div className="flex gap-4">
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
