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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Tailwind classes pre dark/light mode
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const buttonHoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <nav className={`fixed top-0 left-0 right-0 h-16 z-50 ${bgColor} ${textColor} shadow-md min-w-[320px]`}>
      <div className="h-full flex items-center justify-between relative px-4">
        {/* Ľavá skupina */}
        <div className="flex items-center space-x-4">
          {/* Hamburger menu, zobrazené iba pod 820px */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg ${buttonHoverBg} transition-colors block min-[820px]:hidden`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Rozbalené menu pre menšie obrazovky */}
          {isMenuOpen && (
            <div className="absolute top-16 left-0 w-auto bg-gray-100 dark:bg-gray-800 p-2 shadow-lg min-[820px]:hidden">
              <Link
                to="/"
                className={`block mb-2 p-2 rounded-lg ${buttonHoverBg} transition-colors hover:bg-gray-200 dark:hover:bg-gray-700`}
              >
                SenDeliver
              </Link>
              <Link
                to="/login"
                className={`block mb-2 p-2 rounded-lg ${buttonHoverBg} transition-colors hover:bg-gray-200 dark:hover:bg-gray-700`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className={`block p-2 rounded-lg ${buttonHoverBg} transition-colors hover:bg-gray-200 dark:hover:bg-gray-700`}
              >
                Create account
              </Link>
            </div>
          )}

          {/* Logo s hover efektom */}
          <Link to="/" className="group">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-8 h-8 transition-transform transform group-hover:scale-110"
            />
          </Link>

          {/* Názov projektu s animovaným hover efektom */}
          <span
            className="hidden md:block text-lg font-semibold cursor-pointer relative group"
            onClick={() => setIsProjectModalOpen(true)}
          >
            SenDeliver
            <span className="absolute left-1/2 bottom-0 h-[2px] bg-current w-0 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </span>
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

          {/* Prihlásenie/Registrácia v jednom riadku */}
          <div className="absolute left-full ml-6 hidden min-[820px]:flex items-center space-x-3">
            <button className={`px-3 py-2 whitespace-nowrap rounded-lg ${buttonHoverBg} transition-colors`}>
              Log In
            </button>
            <button className="px-3 py-2 whitespace-nowrap rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
              Create account
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
              className="w-6 h-6 filter grayscale group-hover:filter-none transition-transform transform group-hover:scale-110"
            />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg ${buttonHoverBg} transition-colors group`}
            aria-label="Toggle dark mode"
          >
            <div className="group-hover:hidden transform group-hover:scale-110">{isDarkMode ? <Moon size={24} /> : <Sun size={24} />}</div>
            <div className="hidden group-hover:block transform group-hover:scale-110">{isDarkMode ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-yellow-500" />}</div>
          </button>
        </div>
      </div>

      {/* Modal pre popis projektu */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-3/4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">About SenDeliver</h2>
            <p className="mb-4">SenDeliver is a comprehensive platform designed for seamless logistics and delivery management...</p>
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
