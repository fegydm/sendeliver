import { useState } from 'react';
import { Menu, Sun, Moon, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Definujeme typy
type Language = {
  name: string;
  flagPath: string;
};

type Languages = {
  [key: string]: Language;
};

type NavigationProps = {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

const languages: Languages = {
  en: {
    name: 'English',
    flagPath: '/flags/4x3/optimized/gb.svg',
  },
  sk: {
    name: 'Slovenčina',
    flagPath: '/flags/4x3/optimized/sk.svg',
  },
};

const Navigation = ({ isDarkMode, onToggleDarkMode }: NavigationProps) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<keyof Languages>('en');
  const [isHovered, setIsHovered] = useState(false);

  const navBackgroundColor = isDarkMode ? 'bg-hauler-gray-800' : 'bg-hauler-gray-200';
  const buttonBackgroundColor = isDarkMode ? 'bg-hauler-gray-700' : 'bg-hauler-gray-300';

  const showSunIcon = (!isDarkMode && !isHovered) || (isDarkMode && isHovered);

  return (
    <div>
      <nav className={`w-full ${navBackgroundColor} text-white h-16 flex relative`}>
        {/* Ľavá skupina */}
        <div className="w-[160px] sm:w-[200px] flex items-center space-x-4 px-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${buttonBackgroundColor}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center">
            <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
            <span className="hidden sm:inline text-lg font-semibold">SenDeliver</span>
          </Link>
        </div>

        {/* Stredová časť s avatarom */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Bodky */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4">
            <div className="grid grid-rows-2 grid-cols-3 gap-1">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="w-3 h-3 rounded-full bg-green-700" />
            </div>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-hauler-gray-600 flex items-center justify-center">
            <span className="text-sm">A</span>
          </div>

          {/* Prihlásenie/Registrácia */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4">
            <div className="hidden min-[840px]:flex items-center space-x-2">
              <button className={`px-4 py-2 rounded-lg ${buttonBackgroundColor}`}>
                Prihlásenie
              </button>
              <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                Registrácia
              </button>
            </div>
          </div>
        </div>

        {/* Pravá skupina */}
        <div className="w-[160px] sm:w-[200px] flex items-center justify-end space-x-4 px-4 ml-auto">
          {/* Flag button */}
          <div className={`${buttonBackgroundColor} rounded-lg flex items-center justify-center`}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-2 w-full h-full"
            >
              <img
                src={languages[currentLang].flagPath}
                alt={languages[currentLang].name}
                className="w-6 h-6 grayscale hover:grayscale-0 transition-all duration-200"
              />
            </button>
          </div>

          {/* Dark mode toggle */}
          <div className={`${buttonBackgroundColor} rounded-lg flex items-center justify-center`}>
            <button
              onClick={onToggleDarkMode}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="p-2 w-full h-full"
              aria-label="Toggle dark mode"
            >
              {showSunIcon ? (
                <Sun className="w-6 h-6 text-gray-400 hover:text-yellow-400 transition-colors duration-200" />
              ) : (
                <Moon className="w-6 h-6 text-gray-400 hover:text-yellow-400 transition-colors duration-200" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Dropdown menu */}
      {isLangMenuOpen && (
        <div className="absolute top-16 right-0 mt-2 py-2 w-48 bg-hauler-gray-800 rounded-lg shadow-xl z-50">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => {
                setCurrentLang(code as keyof Languages);
                setIsLangMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-hauler-gray-700 transition-colors"
            >
              <img src={lang.flagPath} alt={lang.name} className="w-6 h-6" />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-48 bg-hauler-gray-900 shadow-lg rounded-b-lg z-50">
          <Link to="/" className="block px-4 py-2 hover:bg-hauler-gray-700 transition-colors">
            SenDeliver
          </Link>
          <button className="w-full text-left px-4 py-2 hover:bg-hauler-gray-700 transition-colors">
            Prihlásenie
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-hauler-gray-700 transition-colors">
            Registrácia
          </button>
        </div>
      )}
    </div>
  );
};

export default Navigation;
