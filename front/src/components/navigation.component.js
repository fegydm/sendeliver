import React, { useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

const UserState = {
  COOKIES_DISABLED: 'COOKIES_DISABLED', 
  COOKIES_ENABLED: 'COOKIES_ENABLED',
  LOGGED_IN: 'LOGGED_IN'
};

const languages = {
  en: {
    name: 'English',
    flagPath: '/flags/4x3/optimized/gb.svg'
  },
  sk: {
    name: 'Slovenčina',
    flagPath: '/flags/4x3/optimized/sk.svg'
  }
};

const Navigation = ({ 
  userState = UserState.COOKIES_DISABLED,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const colorIndicators = {
    client: 'bg-pink-500',
    forwarder: 'bg-blue-500',
    carrier: 'bg-green-500',
    COOKIES_DISABLED: 'bg-red-500',
    COOKIES_ENABLED: 'bg-orange-500',
    LOGGED_IN: 'bg-green-700',
    gray: 'bg-gray-300'
  };

  const getDotColor = (type, currentState) => {
    return type === currentState ? colorIndicators[type] : colorIndicators.gray;
  };

  return (
    <nav className="w-full bg-gray-800 text-white h-16 flex relative">
      {/* Ľavá skupina */}
      <div className="w-[160px] sm:w-[200px] flex items-center space-x-4 px-4">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img src="/favicon4.png" alt="Home" className="w-6 h-6" />
        <span className="hidden sm:inline text-lg font-semibold">SenDeliver</span>
      </div>

      {/* Centrovaný avatar s absolútne pozicovanými prvkami */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Bodky naľavo od avatara */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4">
          <div className="grid grid-rows-2 grid-cols-3 gap-1">
            <div className={`w-3 h-3 rounded-full ${getDotColor('client', userState)}`} />
            <div className={`w-3 h-3 rounded-full ${getDotColor('forwarder', userState)}`} />
            <div className={`w-3 h-3 rounded-full ${getDotColor('carrier', userState)}`} />
            <div className={`w-3 h-3 rounded-full ${getDotColor('COOKIES_DISABLED', userState)}`} />
            <div className={`w-3 h-3 rounded-full ${getDotColor('COOKIES_ENABLED', userState)}`} />
            <div className={`w-3 h-3 rounded-full ${getDotColor('LOGGED_IN', userState)}`} />
          </div>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          <span className="text-sm">A</span>
        </div>

        {/* Tlačidlá napravo od avatara */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4">
          <div className="hidden min-[840px]:flex items-center space-x-2">
            <button className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
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
        {/* Jazykový prepínač */}
        <div className="relative">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="p-2 rounded-lg transition-colors flex items-center space-x-2 hover:bg-gray-700 group"
          >
            <div className="w-6 h-6">
              <img 
                src={languages[currentLang].flagPath}
                alt={languages[currentLang].name}
                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-200"
              />
            </div>
          </button>
          {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-gray-800 rounded-lg shadow-xl z-50">
              {Object.entries(languages).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => {
                    setCurrentLang(code);
                    setIsLangMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-gray-700 transition-colors"
                >
                  <div className="w-6 h-6">
                    <img 
                      src={lang.flagPath}
                      alt={lang.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors group"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-all duration-200" />
          ) : (
            <Moon className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-all duration-200" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;