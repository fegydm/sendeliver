// File: front/src/configs/theme.config.ts
// Last change: Centralized default theme settings for external use.

import { ThemeSettings } from '@/types/domains/theme.types';

export const defaultThemeSettings: ThemeSettings = {
  mode: 'light',
  primaryColor: { h: 150, s: 60, l: 30 },
  typography: { fontSizeBase: 16 },
  layout: { borderRadius: 6 },
};
