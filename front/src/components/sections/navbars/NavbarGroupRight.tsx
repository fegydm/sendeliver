// ./front/src/components/navbars/NavbarGroupRight.tsx
import { type FC } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
interface NavRightGroupProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavRightGroup: FC<NavRightGroupProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className="navbar-group right">
      {/* Language Selector */}
      <button className="navbar-language-button" aria-label="Change language">
        <img
          src="/flags/4x3/optimized/gb.svg"
          alt="Change language"
          className="language-icon"
        />
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={onToggleDarkMode}
        className="navbar-darkmode-button"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <FiMoon className="darkmode-icon" />
        ) : (
          <FiSun className="darkmode-icon" />
        )}
      </button>
    </div>
  );
};

export default NavRightGroup;
