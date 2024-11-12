// ./front/src/components/navigation/nav-right-group.component.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";

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
          <Moon className="w-6 h-6" />
        ) : (
          <Sun className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default NavRightGroup;
