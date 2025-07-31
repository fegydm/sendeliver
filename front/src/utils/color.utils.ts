// File: front/src/utils/color.utils.ts
// Last change: Renamed function to match context import.

import { ThemeSettings } from '@/types/domains/theme.types';

export const generateCssVariables = (settings: ThemeSettings): Record<string, string> => {
  const { primaryColor, mode } = settings;
  const { h, s, l } = primaryColor;

  let gradientStart, gradientEnd;

  if (mode === 'light') {
    gradientStart = `hsl(${h}, 50%, 92%)`;
    gradientEnd = `hsl(${h}, 30%, 85%)`;
  } else {
    gradientStart = `hsl(${h}, 20%, 25%)`;
    gradientEnd = `hsl(${h}, 15%, 20%)`;
  }

  return {
    '--primary-h': String(h),
    '--primary-s': `${s}%`,
    '--primary-l': `${l}%`,
    '--tab-inactive-bg': `hsl(${h}, ${Math.max(15, s * 0.7)}%, ${Math.min(95, l + (100 - l) * 0.7)}%)`,
    '--tab-hover-bg': `hsl(${h}, ${Math.min(100, s * 1.1)}%, ${Math.max(10, l * 0.95)}%)`,
    '--gradient-start': gradientStart,
    '--gradient-end': gradientEnd,
  };
};
