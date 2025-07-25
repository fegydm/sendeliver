// File: front/src/components/shared/navbars/NavbarDarkmode.tsx
// Last action: Refactored component to use BEM class names.

import { FC } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./darkmode.navbar.css";

interface NavbarDarkmodeProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavbarDarkmode: FC<NavbarDarkmodeProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <button
      onClick={onToggleDarkMode}
      className="navbar-darkmode"
      aria-label="Toggle dark mode"
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