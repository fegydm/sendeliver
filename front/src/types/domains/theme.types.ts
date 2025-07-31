// File: front/src/domains/types/theme.types.ts
// Last change: Aligned with the new ThemeSettings object structure.

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface ThemeSettings {
  primaryColor: HslColor;
  mode: 'light' | 'dark';
  typography: {
    fontSizeBase: number;
  };
  layout: {
    borderRadius: number;
  };
}
