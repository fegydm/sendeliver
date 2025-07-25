// ./front/src/constants/colors/semantic.ts
import { base } from './base';

export const semantic = {
  text: {
    light: {
      primary: base.gray[800],
      secondary: base.gray[600],
      disabled: base.gray[400],
    },
    dark: {
      primary: base.fixed.white,
      secondary: base.gray[400],
      disabled: base.gray[600],
    },
  },

  background: {
    light: {
      primary: base.fixed.white,
      secondary: base.gray[50],
      tertiary: base.gray[100],
    },
    dark: {
      primary: base.gray[900],
      secondary: base.gray[800],
      tertiary: base.gray[700],
    },
  },

  border: {
    light: {
      primary: base.gray[200],
      secondary: base.gray[300],
    },
    dark: {
      primary: base.gray[700],
      secondary: base.gray[600],
    },
  },

  interactive: {
    light: {
      hover: base.gray[100],
      active: base.gray[200],
      focus: base.primary[100],
    },
    dark: {
      hover: base.gray[700],
      active: base.gray[600],
      focus: base.primary[800],
    },
  },
} as const;

export type SemanticColors = typeof semantic;