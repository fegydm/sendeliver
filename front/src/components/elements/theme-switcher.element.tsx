import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem, ToggleGroupValue } from "@/components/ui/toggle-group.ui";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import "./theme-switcher.element.css";
import "@/styles/themes.css";

type ThemeType = "none" | "default" | "testing" | "custom";
type ViewModeType = "2D" | "3D";
type ThemeData = Record<string, string>;

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>("none");
  const [viewMode, setViewMode] = useState<ViewModeType>("2D");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [themeData, setThemeData] = useState<ThemeData>({});

  useEffect(() => {
    // Odstránime všetky predchádzajúce classes
    document.documentElement.className = '';
    
    // Pridáme novú class podľa témy
    if (theme !== 'none') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // Pre custom tému nastavíme CSS premenné
    if (theme === 'custom') {
      document.documentElement.style.setProperty('--page-background', themeData.page_bg_custom || '#ffffff');
      document.documentElement.style.setProperty('--navbar-background', themeData.navbar_bg_custom || '#ffffff');
      document.documentElement.style.setProperty('--modal-background', themeData.modal_bg_custom || '#ffffff');
    } else {
      document.documentElement.removeAttribute('style');
    }
  }, [theme, themeData]);

  const handleThemeChange = (value: ToggleGroupValue) => {
    if (value === "custom") {
      setIsCustomModalOpen(true);
    } else if (value) {
      setTheme(value as ThemeType);
    }
  };

  const handleThemeDataSave = (data: ThemeData) => {
    setThemeData(data);
    setTheme("custom");
    setIsCustomModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme Switcher</label>
        <div className="relative">
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

      <div className="space-y-2">
        <label className="text-sm font-medium">View Mode</label>
        <div className="relative">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: ToggleGroupValue) => value && setViewMode(value as ViewModeType)}
            className="toggle-group"
          >
            <ToggleGroupItem value="2D">2D</ToggleGroupItem>
            <ToggleGroupItem value="3D">3D</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

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