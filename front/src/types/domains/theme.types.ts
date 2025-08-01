// File: front/src/types/domains/theme.types.ts
// Last change: Added optional secondaryColor to ThemeSettings for future use.

/**
 * HSL color interface.
 */
export interface HslColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Represents a custom theme mode, e.g., 'light', 'dark', 'cosmic', etc.
 * This type is a string to allow for future custom theme modes
 * without changing the type definition.
 */
export type ThemeMode = string;

/**
 * Interface for the entire theme settings object.
 * It contains the base color, current mode, and other style settings.
 */
export interface ThemeSettings {
  primaryColor: HslColor;
  secondaryColor?: HslColor; // 'secondaryColor' is now an optional property
  mode: ThemeMode;
  typography: {
    fontSizeBase: number;
  };
  layout: {
    borderRadius: number;
  };
}