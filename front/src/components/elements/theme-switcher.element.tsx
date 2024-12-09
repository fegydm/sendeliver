// src/components/elements/theme-switcher.element.tsx
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.ui";

const themes = ["none", "default", "testing", "user-defined"] as const;
type Theme = (typeof themes)[number];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("default");

  const handleThemeChange = (value: string | string[]) => {
    if (typeof value === "string") {
      setCurrentTheme(value as Theme);
      document.documentElement.setAttribute("data-theme", value);
    } else {
      // Handle the case where value is an array, if needed
      console.error("Unexpected array value:", value);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={currentTheme}
      onValueChange={handleThemeChange}
      className="flex gap-1"
    >
      {themes.map((theme) => (
        <ToggleGroupItem
          key={theme}
          value={theme}
          aria-label={`${theme} theme`}
          className="px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default ThemeSwitcher;
