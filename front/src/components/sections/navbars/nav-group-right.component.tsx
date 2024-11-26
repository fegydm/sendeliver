// ./front/src/components/navbars/nav-right-group.component.tsx
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
    <div className="flex items-center space-x-4">
      {/* Language Selector */}
      <button
        className="p-2 rounded-md hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors flex items-center justify-center"
        aria-label="Change language"
      >
        <img
          src="/flags/4x3/optimized/gb.svg"
          alt="Change language"
          className="w-6 h-4 grayscale hover:grayscale-0 transition-all duration-200"
        />
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={onToggleDarkMode}
        className="p-2 rounded-md hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors flex items-center justify-center"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <FiMoon className="w-5 h-5 text-navbar-dark-text" />
        ) : (
          <FiSun className="w-5 h-5 text-navbar-light-text" />
        )}
      </button>
    </div>
  );
};

export default NavRightGroup;
