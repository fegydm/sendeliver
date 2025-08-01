// File: front/src/configs/theme.config.ts
// Last change: Refactored to use unified color definitions from role-colors.config.ts.

import { ThemeSettings, HslColor, ThemeMode } from '@/types/domains/theme.types';
import { DEFAULT_ROLE_COLORS } from './role-colors.config';

// Default theme settings. Note: primary and secondary colors are dynamic.
export const DEFAULT_THEME_SETTINGS: Omit<ThemeSettings, 'primaryColor' | 'secondaryColor' | 'mode'> = {
  typography: {
    fontSizeBase: 16
  },
  layout: {
    borderRadius: 6
  },
};

// Theme storage keys for localStorage
export const THEME_STORAGE_KEYS = {
  USER_ROLE_COLORS: 'userRoleColors',
  THEME_MODE: 'themeMode',
  // Prepared for database sync
  LAST_DB_SYNC: 'themeLastDbSync',
  PENDING_CHANGES: 'themePendingChanges',
} as const;

/**
 * Gets user color for a specific role with a fallback chain.
 *
 * 1. Database setting (future)
 * 2. localStorage setting (current)
 * 3. Default config color (fallback from role-colors.config.ts)
 * @param role The user's role (e.g., 'hauler', 'sender').
 * @param userId Optional user ID for database lookup.
 * @param colorType The type of color to get ('primary' or 'secondary').
 * @returns The HSL color for the specified role.
 */
export const getUserRoleColor = async (
  role: keyof typeof DEFAULT_ROLE_COLORS,
  userId?: string,
  colorType: 'primary' | 'secondary' = 'primary'
): Promise<HslColor> => {

  const storageKey = THEME_STORAGE_KEYS.USER_ROLE_COLORS;

  // TODO: Database lookup (future implementation)
  if (userId) {
    try {
      // const dbColor = await fetchUserThemeFromDB(userId, role, colorType);
      // if (dbColor) return dbColor;
    } catch (error) {
      console.warn(`Failed to fetch theme from database for user ${userId}:`, error);
    }
  }

  // localStorage lookup (current)
  try {
    const savedColors = localStorage.getItem(storageKey);
    if (savedColors) {
      const userColors = JSON.parse(savedColors) as Record<string, { primary: HslColor; secondary: HslColor }>;
      if (userColors[role] && userColors[role][colorType]) {
        return userColors[role][colorType];
      }
    }
  } catch (error) {
    console.warn(`Failed to parse user colors from localStorage:`, error);
  }

  // Config fallback
  // Use the unified DEFAULT_ROLE_COLORS for the fallback
  return DEFAULT_ROLE_COLORS[role][colorType];
};

/**
 * Saves user color with localStorage + database sync (future).
 *
 * @param role The user's role.
 * @param color The HSL color to save.
 * @param userId Optional user ID for database sync.
 * @param colorType The type of color to save ('primary' or 'secondary').
 */
export const saveUserRoleColor = async (
  role: keyof typeof DEFAULT_ROLE_COLORS,
  color: HslColor,
  userId?: string,
  colorType: 'primary' | 'secondary' = 'primary'
): Promise<void> => {
  const storageKey = THEME_STORAGE_KEYS.USER_ROLE_COLORS;
  
  try {
    const savedColors = localStorage.getItem(storageKey);
    const userColors = savedColors ? JSON.parse(savedColors) as Record<string, { primary: HslColor; secondary: HslColor }> : {};
    
    // Ensure the role object exists before updating
    if (!userColors[role]) {
      userColors[role] = { ...DEFAULT_ROLE_COLORS[role] };
    }
    
    userColors[role][colorType] = color;
    localStorage.setItem(storageKey, JSON.stringify(userColors));
  } catch (error) {
    console.error('Failed to save color to localStorage:', error);
  }

  // TODO: Database sync (future implementation)
  if (userId) {
    try {
      // Mark as pending for database sync
      const pending = localStorage.getItem(THEME_STORAGE_KEYS.PENDING_CHANGES);
      const pendingChanges = pending ? JSON.parse(pending) : {};
      pendingChanges[`${role}-${colorType}`] = { color, timestamp: Date.now() };
      localStorage.setItem(THEME_STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(pendingChanges));
      
      // Actual database save (to be implemented)
      // await saveUserThemeToDB(userId, role, color, colorType);
      
      // Clear pending changes on success
      // delete pendingChanges[`${role}-${colorType}`];
      // localStorage.setItem(THEME_STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(pendingChanges));
      
    } catch (error) {
      console.warn(`Failed to sync color to database for user ${userId}:`, error);
    }
  }
};

/**
 * Gets theme mode with fallback
 */
export const getThemeMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEYS.THEME_MODE);
    return (saved as ThemeMode) || 'light';
  } catch {
    return 'light';
  }
};

/**
 * Saves theme mode
 */
export const saveThemeMode = (mode: ThemeMode): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEYS.THEME_MODE, mode);
  } catch (error) {
    console.error('Failed to save theme mode:', error);
  }
};