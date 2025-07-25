// File: front/src/constants/theme/colors.ts
// Last change: Fixed type conflict with generateShades function

import { generateShades } from "@/lib/utils/colorUtils";

export const TWColor = {
  slate: true,
  gray: true,
  zinc: true,
  neutral: true,
  stone: true,
  red: true,
  orange: true,
  amber: true,
  yellow: true,
  lime: true,
  green: true,
  emerald: true,
  teal: true,
  cyan: true,
  sky: true,
  blue: true,
  indigo: true,
  violet: true,
  purple: true,
  fuchsia: true,
  pink: true,
  rose: true,
} as const;

export const CSColor: Record<string, Record<string, string>> = {
  magenta: generateShades("#fce4f0", "#8b0046"),
  skyBlue: generateShades("#e6f7ff", "#003666"),
  appleGreen: generateShades("#e8fae6", "#1a5d1a"),
} as const;
