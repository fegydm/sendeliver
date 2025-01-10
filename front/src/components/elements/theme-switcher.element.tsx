// ./front/src/components/elements/theme-switcher.element.tsx
import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem, ToggleGroupValue } from "@/components/ui/toggle-group.ui";
import GeneralModal from "@/components/modals/general.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";

/** Theme and View Mode Types */
type ThemeType = "none" | "basic" | "default" | "testing" | "custom";
type ViewModeType = "2D" | "3D";

/** ThemeSwitcher Component */
const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useState<ThemeType>("basic");
    const [viewMode, setViewMode] = useState<ViewModeType>("2D");
    const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
    const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

    useEffect(() => {
        const themeLink = document.getElementById("theme-link") as HTMLLinkElement;

        if (!themeLink) {
            console.error("⚠️ Theme link element not found!");
            return;
        }

        const cssPath = "/src/styles/themes/";
        
        // Dynamické vrstvenie štýlov
        if (theme === "none") {
            themeLink.href = `${cssPath}none.css`;
        } 
        else if (theme === "basic") {
            themeLink.href = `${cssPath}basic.css`;
        } 
        else if (theme === "default") {
            themeLink.href = `${cssPath}basic.css`;
            setTimeout(() => {
                themeLink.href = `${cssPath}default.css`;
            }, 10); // Zabezpečenie načítania vrstvy
        } 
        else if (theme === "testing") {
            themeLink.href = `${cssPath}basic.css`;
            setTimeout(() => {
                themeLink.href = `${cssPath}testing.css`;
            }, 10);
        } 
        else if (theme === "custom") {
            setIsGeneralModalOpen(true);
        }
        console.log("✅ Theme applied:", themeLink.href);
    }, [theme]);

    /** Theme Change Handler */
    const handleThemeChange = (value: ToggleGroupValue) => {
        if (value && typeof value === "string") {
            setTheme(value as ThemeType);
        }
    };

    /** View Mode Change Handler */
    const handleViewModeChange = (value: ToggleGroupValue) => {
        if (value && typeof value === "string") {
            setViewMode(value as ViewModeType);
        }
    };

    return (
        <div className="theme-switcher-container">
            {/* Theme Selection */}
            <div className="theme-group">
                <label>Theme:</label>
                <ToggleGroup type="single" value={theme} onValueChange={handleThemeChange}>
                    <ToggleGroupItem value="none">None</ToggleGroupItem>
                    <ToggleGroupItem value="basic">Basic</ToggleGroupItem>
                    <ToggleGroupItem value="default">Default</ToggleGroupItem>
                    <ToggleGroupItem value="testing">Testing</ToggleGroupItem>
                    <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* View Mode Selection */}
            <div className="view-mode-group">
                <label>View Mode:</label>
                <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
                    <ToggleGroupItem value="2D">2D</ToggleGroupItem>
                    <ToggleGroupItem value="3D">3D</ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* General Modal */}
            <GeneralModal
                isOpen={isGeneralModalOpen}
                onClose={() => setIsGeneralModalOpen(false)}
                title="Customize Theme"
            >
                <p>Customize your theme settings here.</p>
                <button onClick={() => setIsColorPaletteOpen(true)}>Open Color Palette</button>
            </GeneralModal>

            {/* Color Palette Modal */}
            <ColorPaletteModal
                isOpen={isColorPaletteOpen}
                onClose={() => setIsColorPaletteOpen(false)}
            />
        </div>
    );
};

export default ThemeSwitcher;
