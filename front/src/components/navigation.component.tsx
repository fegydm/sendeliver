import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, X } from 'lucide-react';

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Tailwind classes pre dark/light mode
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const buttonHoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <nav className={`fixed top-0 left-0 right-0 h-16 z-50 ${bgColor} ${textColor} shadow-md min-w-[320px]`}>
      <div className="h-full flex items-center justify-between relative px-4">
        {/* Ľavá skupina */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg ${buttonHoverBg} transition-colors`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center space-x-3">
            <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
            <span className="hidden md:block text-lg font-semibold">SenDeliver</span>
          </Link>
        </div>

        {/* Stredná skupina - fixne v strede */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          {/* 6 bodiek */}
          <div className="absolute right-full mr-6">
            <div className="grid grid-rows-2 grid-cols-3 gap-1">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>

          {/* Prihlásenie/Registrácia */}
          <div className="absolute left-full ml-6 hidden min-[820px]:flex items-center space-x-3">
            <button className={`px-4 py-2 rounded-lg ${buttonHoverBg} transition-colors`}>
              Prihlásenie
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
              Registrácia
            </button>
          </div>
        </div>

        {/* Pravá skupina */}
        <div className="flex items-center space-x-3">
          {/* Language selector */}
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className={`p-2 rounded-lg ${buttonHoverBg} transition-colors group`}
          >
            <img
              src="/flags/4x3/optimized/gb.svg"
              alt="Language"
              className="w-6 h-6 filter grayscale group-hover:filter-none transition-all"
            />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg ${buttonHoverBg} transition-colors group`}
            aria-label="Toggle dark mode"
          >
            <div className="group-hover:hidden">{isDarkMode ? <Moon size={24} /> : <Sun size={24} />}</div>
            <div className="hidden group-hover:block">{isDarkMode ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-yellow-500" />}</div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
