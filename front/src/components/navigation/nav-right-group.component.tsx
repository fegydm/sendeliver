// ./front/src/components/navigation/nav-right-group.component.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface NavRightGroupProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NavRightGroup: React.FC<NavRightGroupProps> = ({
  isDarkMode,
  onToggleDarkMode
}) => {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-3">
      <button className="p-2 rounded-lg hover:bg-hauler-gray-200 
                      dark:hover:bg-hauler-gray-800 transition-colors group">
        <img
          src="/flags/4x3/optimized/gb.svg"
          alt="Language"
          className="w-6 h-6 filter grayscale group-hover:filter-none 
                  transition-transform transform group-hover:scale-110"
        />
      </button>

      <button
        onClick={onToggleDarkMode}
        className="p-2 rounded-lg hover:bg-hauler-gray-200 
                dark:hover:bg-hauler-gray-800 transition-colors group"
        aria-label="Toggle dark mode"
      >
        <div className="group-hover:hidden transform group-hover:scale-110">
          {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
        </div>
        <div className="hidden group-hover:block transform group-hover:scale-110">
          {isDarkMode ? <Sun size={24} className="text-yellow-500" /> : 
                     <Moon size={24} className="text-yellow-500" />}
        </div>
      </button>
    </div>
  );
};

export default NavRightGroup;