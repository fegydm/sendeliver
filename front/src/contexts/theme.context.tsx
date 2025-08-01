// File: front/src/contexts/theme.context.tsx
// Last change: Refactored to use theme.config functions for all data fetching logic.

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeSettings, HslColor } from '@/types/domains/theme.types';
import {
  DEFAULT_THEME_SETTINGS,
  getThemeMode,
  getUserRoleColor,
  saveUserRoleColor,
  saveThemeMode,
} from '@/configs/theme.config';
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
  userId?: string; // Add userId to props to support database logic
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, activeRole, userId }) => {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load and apply theme settings
  useEffect(() => {
    if (!activeRole) {
      setIsLoading(false);
      return;
    }
    
    const applyTheme = async () => {
      setIsLoading(true);
      try {
        // Fetch the user's color using the centralized logic
        const baseColor = await getUserRoleColor(activeRole, userId);
        const mode = getThemeMode();

        const currentSettings: ThemeSettings = {
          ...DEFAULT_THEME_SETTINGS,
          primaryColor: baseColor,
          mode,
        };

        setSettings(currentSettings);

        // Apply CSS variables using the utility
        const cssVariables = generateCssVariables(currentSettings);
        const root = document.documentElement;
        Object.entries(cssVariables).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
        root.setAttribute('data-theme', mode);
      } catch (error) {
        console.error('Failed to apply theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    applyTheme();
  }, [activeRole, userId]);

  // Use the centralized save function
  const updateRoleColor = useCallback(async (role: Role, newColor: HslColor) => {
    // Save the new color and then re-apply theme
    await saveUserRoleColor(role, newColor, userId);
    if (activeRole === role) {
      // Re-apply theme only if the active role's color was updated
      setSettings(prevSettings => prevSettings ? { ...prevSettings, primaryColor: newColor } : null);
      const cssVariables = generateCssVariables({ ...settings!, primaryColor: newColor });
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [activeRole, userId, settings]);

  // Use the centralized save function
  const setMode = useCallback((mode: 'light' | 'dark') => {
    if (settings) {
      saveThemeMode(mode);
      const newSettings = { ...settings, mode };
      setSettings(newSettings);
      document.documentElement.setAttribute('data-theme', mode);
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