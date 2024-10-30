// ./front/src/components/navigation.component.js
import React, { useState } from 'react';
import { Menu, Home, Sun, Moon } from 'lucide-react';

const UserState = {
  COOKIES_DISABLED: 'COOKIES_DISABLED', 
  COOKIES_ENABLED: 'COOKIES_ENABLED',
  LOGGED_IN: 'LOGGED_IN'
};

const languages = {
  en: {
    name: 'English',
    flag: '🇬🇧',
    grayFlag: '/images/flags/gb-gray.svg',  // Potrebujeme vytvoriť SVG vlajky
  },
  sk: {
    name: 'Slovenčina',
    flag: '🇸🇰',
    grayFlag: '/images/flags/sk-gray.svg',
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

  const getIndicatorColors = (currentState, indicatorState) => {
    const baseClasses = "w-3 h-3 rounded-full mx-1 transition-colors duration-200";
    
    if (currentState === indicatorState) {
      switch (indicatorState) {
        case UserState.COOKIES_DISABLED:
          return `${baseClasses} bg-red-500`;
        case UserState.COOKIES_ENABLED:
          return `${baseClasses} bg-orange-500`;
        case UserState.LOGGED_IN:
          return `${baseClasses} bg-green-500`;
        default:
          return `${baseClasses} bg-gray-300`;
      }
    }
    return `${baseClasses} bg-gray-300`;
  };

  return (
    <nav className="w-full bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Ľavá sekcia */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Home className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-semibold">SenDeliver</span>
          </div>

          {/* Stredná sekcia */}
          <div className="flex items-center space-x-8">
            {/* Semafory */}
            <div className="flex items-center">
              <div className={getIndicatorColors(userState, UserState.COOKIES_DISABLED)} />
              <div className={getIndicatorColors(userState, UserState.COOKIES_ENABLED)} />
              <div className={getIndicatorColors(userState, UserState.LOGGED_IN)} />
            </div>
            
            {/* Auth tlačidlá */}
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Prihlásenie
              </button>
              <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                Registrácia
              </button>
            </div>
          </div>

          {/* Pravá sekcia */}
          <div className="flex items-center space-x-4">
            {/* Language Switch */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <img 
                  src={languages[currentLang].grayFlag}
                  alt={languages[currentLang].name}
                  className="w-6 h-6 grayscale hover:grayscale-0 transition-all"
                />
                {isLangMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-gray-800 rounded-lg shadow-xl">
                    {Object.entries(languages).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrentLang(code);
                          setIsLangMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6 hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="w-6 h-6 hover:text-yellow-400 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;