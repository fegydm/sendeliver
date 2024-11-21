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
    <div className="ml-auto flex items-center space-x-4">
      {/* Language selector */}
      <button className="p-2 rounded-md hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors">
        <img
          src="/flags/4x3/optimized/gb.svg"
          alt="Change language"
          className="w-6 h-4 grayscale hover:grayscale-0 transition-all duration-200"
        />
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDarkMode}
        className="p-2 rounded-md hover:bg-navbar-light-hover dark:hover:bg-navbar-dark-hover transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <div className="group">
            <FiMoon className="w-5 h-5 text-navbar-dark-text group-hover:hidden" />
            <FiSun className="w-5 h-5 text-yellow-300 hidden group-hover:block" />
          </div>
        ) : (
          <div className="group">
            <FiSun className="w-5 h-5 text-navbar-light-text group-hover:hidden" />
            <FiMoon className="w-5 h-5 text-yellow-300 hidden group-hover:block" />
          </div>
        )}
      </button>
    </div>
  );
};

export default NavRightGroup;
