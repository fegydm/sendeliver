// File: front/src/components/elements/theme-switcher.comp.tsx

import React, { useState } from "react";
import ThemeEditorModal from "@/components/shared/modals/theme-editor.modal";
import { themeDefaults } from "@/constants/theme-defaults";

interface ThemeSwitcherProps {
  is3DMode?: boolean; // Marked as optional
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ is3DMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const switchTheme = (theme: "none" | "basic" | "default" | "testing") => {
    const linkElement = document.getElementById("theme-link") as HTMLLinkElement;
    if (linkElement) {
      linkElement.href = `/src/styles/themes/${theme}.css`;
    }
  };

  const handleSave = (data: Record<string, string>) => {
    Object.entries(data).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    console.log("Theme variables updated:", data);
  };

  return (
    <div className="theme-switcher">
      <button onClick={() => switchTheme("none")}>None</button>
      <button onClick={() => switchTheme("basic")}>Basic</button>
      <button onClick={() => switchTheme("default")}>Default</button>
      <button onClick={() => switchTheme("testing")}>Testing</button>
      <button onClick={() => setIsModalOpen(true)}>Settings...</button>
      <div>{is3DMode ? "3D Mode Active" : "2D Mode Active"}</div>
      <ThemeEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editorData={themeDefaults}
      />
    </div>
  );
};

export default ThemeSwitcher;
