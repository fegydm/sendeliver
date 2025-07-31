// File: front/src/configs/role-colors.config.ts
// Last change: Defined default base colors for all roles.

import { HslColor } from '@/types/domains/theme.types';

export const DEFAULT_ROLE_COLORS: Record<string, HslColor> = {
  hauler: { h: 110, s: 40, l: 55 },
  sender: { h: 320, s: 60, l: 60 },
  broker: { h: 210, s: 50, l: 60 }, // Default for broker, though not visually used
};
