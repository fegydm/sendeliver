// File: ./front/src/components/sections/footers/footer-test.component.tsx
// Last change: Added React.memo to prevent unnecessary renders

import React, { useState } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";
import { useTestFooter } from "../../../lib/test-footer-context";

const FooterTest: React.FC = React.memo(() => {
    const { isTestFooterVisible } = useTestFooter();
    const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
    const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

    if (!isTestFooterVisible) return null;

    return (
        <footer className="test-footer">
            <div className="footer-container">
                <div className="footer-left">
                    <ThemeSwitcher />
                </div>

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

                <ThemeEditorModal
                    isOpen={isThemeEditorOpen}
                    onClose={() => setIsThemeEditorOpen(false)}
                    editorData={{}}
                    onSave={() => console.log("Theme saved")}
                />

                <ColorPaletteModal
                    isOpen={isColorPaletteOpen}
                    onClose={() => setIsColorPaletteOpen(false)}
                />
            </div>
        </footer>
    );
});

FooterTest.displayName = 'FooterTest';

export default FooterTest;