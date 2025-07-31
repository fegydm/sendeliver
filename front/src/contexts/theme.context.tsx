// File: front/src/contexts/theme.context.tsx
// Last change: Added guards to prevent errors when activeRole is not yet defined.

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeSettings, HslColor } from '@/types/domains/theme.types';
import { defaultThemeSettings } from '@/configs/theme.config';
import { DEFAULT_ROLE_COLORS } from '@/configs/role-colors.config';
import { generateCssVariables } from '@/utils/color.utils';

type Role = 'hauler' | 'sender' | 'broker';

interface ThemeContextValue {
  settings: ThemeSettings | null;
  updateRoleColor: (role: Role, newColor: HslColor) => void;
  setMode: (mode: 'light' | 'dark') => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  activeRole?: Role;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, activeRole }) => {
  const [userRoleColors, setUserRoleColors] = useState<Record<string, HslColor>>({});
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserColors = localStorage.getItem('userRoleColors');
    if (savedUserColors) {
      try {
        setUserRoleColors(JSON.parse(savedUserColors) as Record<string, HslColor>);
      } catch (e) {
        console.error("Failed to parse userRoleColors from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || !activeRole) return;

    const baseColor = userRoleColors[activeRole] || DEFAULT_ROLE_COLORS[activeRole];
    
    if (!baseColor) return;

    const currentSettings: ThemeSettings = {
      ...defaultThemeSettings,
      primaryColor: baseColor,
      mode: (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light',
    };

    setSettings(currentSettings);

    const cssVariables = generateCssVariables(currentSettings);
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute('data-theme', currentSettings.mode);

  }, [activeRole, userRoleColors, isLoading]);

  const updateRoleColor = useCallback((role: Role, newColor: HslColor) => {
    const newColors = { ...userRoleColors, [role]: newColor };
    setUserRoleColors(newColors);
    localStorage.setItem('userRoleColors', JSON.stringify(newColors));
  }, [userRoleColors]);

  const setMode = useCallback((mode: 'light' | 'dark') => {
    if (settings) {
      const newSettings = { ...settings, mode };
      setSettings(newSettings);
      localStorage.setItem('themeMode', mode);
    }
  }, [settings]);

  const contextValue: ThemeContextValue = {
    settings,
    updateRoleColor,
    setMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
