// File: front/src/utils/color.utils.ts
// Last change: Refactored to support an optional secondary color scale.

import { ThemeSettings, HslColor } from '@/types/domains/theme.types';

/**
 * Generates a full color scale (100-900) from a single base color.
 * The scale is adapted for light and dark modes.
 *
 * @param baseColor The base HSL color.
 * @param mode The theme mode ('light' or 'dark').
 * @param prefix The prefix for the color scale (e.g., 'primary', 'secondary').
 * @returns An object with scale-based color strings (e.g., 'primary-500').
 */
const generateColorScale = (baseColor: HslColor, mode: 'light' | 'dark' = 'light', prefix: string) => {
  const { h, s, l } = baseColor;

  // Define luminosity steps for the scale
  const lightSteps = [95, 90, 80, 70, 60, 50, 40, 30, 20];
  const darkSteps = [10, 15, 20, 25, 30, 35, 40, 50, 60];
  const steps = mode === 'light' ? lightSteps : darkSteps;

  const scale: Record<string, string> = {};
  const paletteKeys = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  paletteKeys.forEach((key, index) => {
    let currentL = steps[index];

    let currentS = s;
    if (key <= 300) {
      currentS = Math.max(s * 0.7, 10);
    } else if (key >= 700) {
      currentS = Math.min(s * 1.2, 100);
    }

    scale[`${prefix}-${key}`] = `hsl(${h}, ${currentS}%, ${currentL}%)`;
  });

  scale[`${prefix}-500`] = `hsl(${h}, ${s}%, ${l}%)`;

  return scale;
};

/**
 * Converts theme settings into CSS custom properties.
 *
 * @param settings The theme settings object.
 * @returns An object with CSS variable names and values.
 */
export const generateCssVariables = (settings: ThemeSettings): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Always generate the primary color scale
  const primaryScale = generateColorScale(settings.primaryColor, settings.mode as 'light' | 'dark', 'primary');
  Object.entries(primaryScale).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });

  // Only generate the secondary color scale if it exists
  if (settings.secondaryColor) {
    const secondaryScale = generateColorScale(settings.secondaryColor, settings.mode as 'light' | 'dark', 'secondary');
    Object.entries(secondaryScale).forEach(([key, value]) => {
      cssVars[`--color-${key}`] = value;
    });
  }

  // Add other specific variables
  cssVars['--font-size-base'] = `${settings.typography.fontSizeBase}px`;
  cssVars['--border-radius'] = `${settings.layout.borderRadius}px`;

  // Add simplified variables for gradients based on the primary scale
  if (settings.mode === 'light') {
    cssVars['--color-gradient-start'] = primaryScale['primary-800'];
    cssVars['--color-gradient-end'] = primaryScale['primary-900'];
  } else {
    cssVars['--color-gradient-start'] = primaryScale['primary-700'];
    cssVars['--color-gradient-end'] = primaryScale['primary-800'];
  }

  return cssVars;
};