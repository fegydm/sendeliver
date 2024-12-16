// ./front/src/components/elements/theme-switcher.element.tsx
// ThemeSwitcher Component: Dynamically switches between themes and view modes
import React, { useState, useEffect } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupValue,
} from "@/components/ui/toggle-group.ui";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import "@/styles/components/_theme-switcher.css"; // Import custom CSS

// Define supported themes and view modes
type ThemeType = "none" | "default" | "testing" | "custom";
type ViewModeType = "2D" | "3D";
type ThemeData = Record<string, string>;

// Dynamic imports for theme styles
const themeStyles = {
  none: () => import("@/styles/themes/none.css?inline"),
  default: () => import("@/styles/themes/default.css?inline"),
  testing: () => import("@/styles/themes/testing.css?inline"),
};

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>("default");
  const [viewMode, setViewMode] = useState<ViewModeType>("2D");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [themeData, setThemeData] = useState<ThemeData>({});

  useEffect(() => {
    const loadTheme = async () => {
      // Remove existing theme styles
      const existingStyles =
        document.head.querySelectorAll("style[data-theme]");
      existingStyles.forEach((style) => style.remove());

      // Reset the root class name
      document.documentElement.className = "";

      try {
        // Dynamically load and apply the selected theme
        if (theme in themeStyles) {
          const styleModule =
            await themeStyles[theme as keyof typeof themeStyles]();
          const style = document.createElement("style");
          style.setAttribute("data-theme", theme);
          style.textContent = styleModule.default;
          document.head.appendChild(style);
        }

        // Apply theme-specific root class
        if (theme !== "none") {
          document.documentElement.classList.add(`theme-${theme}`);
        }

        // Apply custom theme variables
        if (theme === "custom" && themeData) {
          document.documentElement.style.setProperty(
            "--page-background",
            themeData.page_bg_custom || "#ffffff"
          );
          document.documentElement.style.setProperty(
            "--navbar-background",
            themeData.navbar_bg_custom || "#ffffff"
          );
          document.documentElement.style.setProperty(
            "--modal-background",
            themeData.modal_bg_custom || "#ffffff"
          );
        } else {
          // Remove inline styles for non-custom themes
          document.documentElement.removeAttribute("style");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, [theme, themeData]);

  const handleThemeChange = (value: ToggleGroupValue) => {
    if (typeof value === "string") {
      if (value === "custom") {
        setIsCustomModalOpen(true);
      } else {
        setTheme(value as ThemeType);
      }
    }
  };

  const handleViewModeChange = (value: ToggleGroupValue) => {
    if (typeof value === "string") {
      setViewMode(value as ViewModeType);
    }
  };

  const handleThemeDataSave = (data: ThemeData) => {
    // Save custom theme data and apply the custom theme
    setThemeData(data);
    setTheme("custom");
    setIsCustomModalOpen(false);
  };

  return (
    <div className="theme-switcher-container">
      {/* Theme Switcher Section */}
      <div className="theme-switcher-section">
        <label className="theme-switcher-label">Theme Switcher</label>
        <div className="theme-switcher-toggle">
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={handleThemeChange}
            className="toggle-group"
          >
            <ToggleGroupItem value="none">None</ToggleGroupItem>
            <ToggleGroupItem value="default">Default</ToggleGroupItem>
            <ToggleGroupItem value="testing">Testing</ToggleGroupItem>
            <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* View Mode Section */}
      <div className="theme-switcher-section">
        <label className="theme-switcher-label">View Mode</label>
        <div className="theme-switcher-toggle">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={handleViewModeChange}
            className="toggle-group"
          >
            <ToggleGroupItem value="2D">2D</ToggleGroupItem>
            <ToggleGroupItem value="3D">3D</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Custom Theme Editor Modal */}
      <ThemeEditorModal
        isOpen={isCustomModalOpen}
        editorData={themeData}
        onSave={handleThemeDataSave}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </div>
  );
};

export default ThemeSwitcher;
