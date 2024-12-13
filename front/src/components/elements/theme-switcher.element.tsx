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
  const [viewMode, setViewMode] = useState<string>("2D"); // State to store the current view mode
  const [theme, setTheme] = useState<string>("none"); // State to store the current theme
  const [isEditorOpen, setIsEditorOpen] = useState(false); // State to control the modal visibility
  const themeGroupRef = useRef<HTMLDivElement>(null); // Ref for the theme toggle group
  const viewGroupRef = useRef<HTMLDivElement>(null); // Ref for the view mode toggle group

  // Handle theme changes
  const handleThemeChange = (value: ToggleGroupValue) => {
    if (typeof value === "string") {
      setTheme(value);
      if (value === "custom") {
        setIsEditorOpen(true); // Open modal for custom theme editing
      }
    }
  };

  // Handle view mode changes
  const handleViewModeChange = (value: ToggleGroupValue) => {
    if (typeof value === "string") {
      setViewMode(value);
    }
  };

  // Set default theme properties on component mount
  useEffect(() => {
    const { colors } = themeConfig;
    if (colors) {
      document.documentElement.style.setProperty(
        "--primary",
        colors.primary || "#000"
      );
      document.documentElement.style.setProperty(
        "--primary-light",
        colors.primaryLight || "#fff"
      );
      document.documentElement.style.setProperty(
        "--toggle-border",
        colors.toggleBorder || "#ccc"
      );
      document.documentElement.style.setProperty(
        "--toggle-text",
        colors.toggleText || "#000"
      );
      document.documentElement.style.setProperty(
        "--toggle-background",
        colors.toggleBackground || "#f0f0f0"
      );
    }
  }, []);

  // Calculate indicator position for toggle groups
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
      return buttonRect.left - groupRect.left + buttonRect.width / 2 - 10; // Center the triangle indicator
    }
    return 0;
  };

  // Update indicator positions when theme or view mode changes
  useEffect(() => {
    if (themeGroupRef.current) {
      const themePosition = getIndicatorPosition(themeGroupRef, theme);
      themeGroupRef.current.style.setProperty(
        "--theme-position",
        `${themePosition}px`
      );
    }
    if (viewGroupRef.current) {
      const viewModePosition = getIndicatorPosition(viewGroupRef, viewMode);
      viewGroupRef.current.style.setProperty(
        "--view-mode-position",
        `${viewModePosition}px`
      );
    }
  }, [theme, viewMode]);

  // Persist settings to local storage
  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("viewMode", viewMode);
  }, [theme, viewMode]);

  // Load settings from local storage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const storedViewMode = localStorage.getItem("viewMode");
    if (storedTheme) setTheme(storedTheme);
    if (storedViewMode) setViewMode(storedViewMode);
  }, []);

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
              transform: `translateX(var(--theme-position, ${getIndicatorPosition(
                themeGroupRef,
                theme
              )}px))`,
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
              transform: `translateX(var(--view-mode-position, ${getIndicatorPosition(
                viewGroupRef,
                viewMode
              )}px))`,
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
