// ./front/src/components/navbars/NavbarDarkmode.tsx
import { FC } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

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
        <FiMoon className="navbar-darkmode-icon" />
      ) : (
        <FiSun className="navbar-darkmode-icon" />
      )}
    </button>
  );
};

export default NavbarDarkmode;