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
      onClick={onToggleDarkMode} // Toggle dark mode on button click
      className="navbar-darkmode"
      aria-label="Toggle dark mode" // Accessibility label for screen readers
    >
      {/* Render appropriate icon based on dark mode state */}
      {isDarkMode ? (
        <FiMoon className="navbar-darkmode-icon" />
      ) : (
        <FiSun className="navbar-darkmode-icon" />
      )}
    </button>
  );
};

export default NavbarDarkmode;
