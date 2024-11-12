// ./front/src/components/navigation/nav-right-group.component.tsx
import React from "react";
<<<<<<< HEAD
import { FiSun, FiMoon } from "react-icons/fi";
=======
import { Sun, Moon } from "lucide-react";
>>>>>>> 5430219 (up css)

interface NavRightGroupProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavRightGroup: React.FC<NavRightGroupProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <div>
      {/* Language selector */}
      <button>
        <img
          src="/flags/4x3/optimized/gb.svg"
          alt="Change language"
          className="w-6 h-6"
        />
      </button>

      {/* Dark mode toggle */}
      <button onClick={onToggleDarkMode} aria-label="Toggle dark mode">
        {isDarkMode ? (
<<<<<<< HEAD
          <FiMoon className="w-6 h-6" />
        ) : (
          <FiSun className="w-6 h-6" />
=======
          <Moon className="w-6 h-6" />
        ) : (
          <Sun className="w-6 h-6" />
>>>>>>> 5430219 (up css)
        )}
      </button>
    </div>
  );
};

export default NavRightGroup;
