// File: ./front/src/components/sections/footers/footer-test.component.tsx
// Last change: Added 2D/3D switch and improved state handling for ThemeSwitcher

import React, { useState } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";
import { useTestFooter } from "@/lib/test-footer-context";

const FooterTest: React.FC = React.memo(() => {
    const { isTestFooterVisible } = useTestFooter();
    const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
    const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
    const [is3DMode, setIs3DMode] = useState(false); // 2D/3D mode toggle

    if (!isTestFooterVisible) return null;

    return (
        <footer className="test-footer">
            <div className="footer-container">
                
                {/* Left Section: Theme Switcher and 2D/3D Toggle */}
                <div className="footer-left">
                    <ThemeSwitcher is3DMode={is3DMode} />
                    <Button
                        variant="secondary"
                        onClick={() => setIs3DMode((prev) => !prev)}
                    >
                        {is3DMode ? "Switch to 2D" : "Switch to 3D"}
                    </Button>
                </div>

                {/* Right Section: Modals Control */}
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
