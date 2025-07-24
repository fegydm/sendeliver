// File: shared/contexts/shared.shared.shared.ltheme.context.context.context.tsx
// Last change: Added TypeScript type annotations for children and improved context

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Context type now includes theme string for consumers
export interface ThemeContextType {
  isDarkMode: boolean;
  theme: 'light' | 'dark';
  toggleDarkMode: () => void;
}

// Default values
const ThemeContext = createContext<themeContextType>({
  isDarkMode: false,
  theme: 'light',
  toggleDarkMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<themeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Compute theme string
  const theme: 'light' | 'dark' = isDarkMode ? 'dark' : 'light';

  // Update document and storage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for consuming context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
