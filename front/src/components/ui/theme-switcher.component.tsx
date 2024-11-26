// front/src/components/ui/theme-switcher.component. tsx

import React, { useState } from "react";

const themes = ["none", "default", "testing", "user-defined"] as const;
type Theme = (typeof themes)[number];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>("default");

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme); // Aplikuj tému na root
  };

  return (
    <footer className="fixed bottom-0 w-full p-4 bg-footer-light dark:bg-footer-dark">
      <div className="flex justify-center space-x-4">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTheme === theme
                ? "bg-footer-active text-footer-active-text"
                : "bg-footer-inactive hover:bg-footer-hover text-footer-inactive-text"
            }`}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </button>
        ))}
      </div>
    </footer>
  );
};

export default ThemeSwitcher;
