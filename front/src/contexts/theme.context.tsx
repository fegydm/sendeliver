// File: front/src/contexts/theme.context.tsx
// Last change: Fixed fetching logic to correctly load both primary and secondary colors.

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeSettings, HslColor, ThemeMode } from '@/types/domains/theme.types';
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
  updateRoleColor: (role: Role, newColor: HslColor, colorType?: 'primary' | 'secondary') => void;
  setMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  activeRole?: Role;
  userId?: string;
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
        const primaryColor = await getUserRoleColor(activeRole, userId, 'primary');
        const secondaryColor = await getUserRoleColor(activeRole, userId, 'secondary');
        const mode = getThemeMode();

        const currentSettings: ThemeSettings = {
          ...DEFAULT_THEME_SETTINGS,
          primaryColor,
          secondaryColor,
          mode,
        };

        setSettings(currentSettings);
        
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
  const updateRoleColor = useCallback(async (role: Role, newColor: HslColor, colorType: 'primary' | 'secondary' = 'primary') => {
    await saveUserRoleColor(role, newColor, userId, colorType);
    if (activeRole === role) {
      const newSettings = settings ? { ...settings, [colorType + 'Color']: newColor } as ThemeSettings : null;
      setSettings(newSettings);
      if (newSettings) {
        const cssVariables = generateCssVariables(newSettings);
        const root = document.documentElement;
        Object.entries(cssVariables).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      }
    }
  }, [activeRole, userId, settings]);

  const setMode = useCallback((mode: ThemeMode) => {
    if (settings) {
      saveThemeMode(mode as 'light' | 'dark');
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