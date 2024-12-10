// src/components/elements/theme-switcher.element.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupValue,
} from "@/components/ui/toggle-group.ui";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import themeConfig from "@/configs/theme-config.json";

const ThemeSwitcher: React.FC = () => {
  const [viewMode, setViewMode] = useState<string>("2D");
  const [theme, setTheme] = useState<string>("none");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const themeGroupRef = useRef<HTMLDivElement>(null);
  const viewGroupRef = useRef<HTMLDivElement>(null);

  // Handler pre zmenu témy
  const handleThemeChange = (value: ToggleGroupValue) => {
    if (typeof value === "string") {
      setTheme(value);
      if (value === "custom") {
        setIsEditorOpen(true);
      }
    }
  };

  // Handler pre zmenu view mode
  const handleViewModeChange = (value: ToggleGroupValue) => {
    if (typeof value === "string") {
      setViewMode(value);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      themeConfig.colors.primary
    );
    document.documentElement.style.setProperty(
      "--primary-light",
      themeConfig.colors.primaryLight
    );
    document.documentElement.style.setProperty(
      "--toggle-border",
      themeConfig.colors.toggleBorder
    );
    document.documentElement.style.setProperty(
      "--toggle-text",
      themeConfig.colors.toggleText
    );
    document.documentElement.style.setProperty(
      "--toggle-background",
      themeConfig.colors.toggleBackground
    );
  }, []);

  const getIndicatorPosition = (
    groupRef: React.RefObject<HTMLDivElement>,
    value: string
  ) => {
    const selectedButton = groupRef.current?.querySelector(
      `[data-value="${value}"]`
    );
    if (selectedButton && groupRef.current) {
      const groupRect = groupRef.current.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      return buttonRect.left - groupRect.left + buttonRect.width / 2;
    }
    return 0;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="toggle-group-label">Theme Switcher</div>
        <div ref={themeGroupRef} className="relative">
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={handleThemeChange}
          >
            <ToggleGroupItem value="none" data-value="none">
              None
            </ToggleGroupItem>
            <ToggleGroupItem value="default" data-value="default">
              Default
            </ToggleGroupItem>
            <ToggleGroupItem value="test" data-value="test">
              Test
            </ToggleGroupItem>
            <ToggleGroupItem value="custom" data-value="custom">
              Custom
            </ToggleGroupItem>
          </ToggleGroup>
          <div
            className="toggle-group-indicator"
            style={{
              transform: `translateX(${getIndicatorPosition(themeGroupRef, theme)}px)`,
            }}
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="toggle-group-label">View Mode</div>
        <div ref={viewGroupRef} className="relative">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={handleViewModeChange}
          >
            <ToggleGroupItem value="2D" data-value="2D">
              2D
            </ToggleGroupItem>
            <ToggleGroupItem value="3D" data-value="3D">
              3D
            </ToggleGroupItem>
          </ToggleGroup>
          <div
            className="toggle-group-indicator"
            style={{
              transform: `translateX(${getIndicatorPosition(viewGroupRef, viewMode)}px)`,
            }}
          />
        </div>
      </div>

      <ThemeEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          if (theme === "custom") {
            setTheme("default");
          }
        }}
      />
    </div>
  );
};

export default ThemeSwitcher;
