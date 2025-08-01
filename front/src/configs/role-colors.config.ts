// File: front/src/configs/role-colors.config.ts
// Last change: Unified default primary and secondary colors for all roles.

import { HslColor } from '@/types/domains/theme.types';

// Define the default primary and secondary color for each role.
// The secondary color is a neutral grey to be used as a fallback for all roles.
export const DEFAULT_ROLE_COLORS: Record<string, { primary: HslColor; secondary: HslColor }> = {
  hauler: {
    primary: { h: 110, s: 40, l: 55 },
    secondary: { h: 210, s: 10, l: 80 } // Light gray
  },
  sender: {
    primary: { h: 320, s: 60, l: 60 },
    secondary: { h: 210, s: 10, l: 80 } // Light gray
  },
  broker: {
    primary: { h: 210, s: 50, l: 60 },
    secondary: { h: 210, s: 10, l: 80 } // Light gray
  },
};