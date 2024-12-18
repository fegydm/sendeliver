import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem, ToggleGroupValue } from "@/components/ui/toggle-group.ui";

type ThemeType = "none" | "default" | "testing" | "custom";
type ViewModeType = "2D" | "3D";

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>("default");
  const [viewMode, setViewMode] = useState<ViewModeType>("2D");

  useEffect(() => {
    document.documentElement.classList.remove('theme-none', 'theme-default', 'theme-testing');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const handleThemeChange = (value: ToggleGroupValue) => {
    if (value && typeof value === "string") {
      setTheme(value as ThemeType);
    }
  };

  const handleViewModeChange = (value: ToggleGroupValue) => {
    if (value && typeof value === "string") {
      setViewMode(value as ViewModeType);
    }
  };

  return (
    <div>
      <div>
        <label>Theme:</label>
        <ToggleGroup type="single" value={theme} onValueChange={handleThemeChange}>
          <ToggleGroupItem value="none">None</ToggleGroupItem>
          <ToggleGroupItem value="default">Default</ToggleGroupItem>
          <ToggleGroupItem value="testing">Testing</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <label>View Mode:</label>
        <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
          <ToggleGroupItem value="2D">2D</ToggleGroupItem>
          <ToggleGroupItem value="3D">3D</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

export default ThemeSwitcher;