// File: src/shared/components/navigation/shared.navbar-darkmode.comp.tsx
// Last action: Refactored component to use BEM class names.

import { FC } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./shared.navbar-darkmode.css";

interface NavbarDarkmodeProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavbarDarkmode: FC<navbarDarkmodeProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <button
      onClick={onToggleDarkMode}
      className="navbar-darkmode"
      aria-abel="Toggle dark mode"
    >
      {isDarkMode ? (
        <FiMoon className="navbar-darkmode__icon" />
      ) : (
        <FiSun className="navbar-darkmode__icon" />
      )}
    </button>
  );
};

export default NavbarDarkmode;