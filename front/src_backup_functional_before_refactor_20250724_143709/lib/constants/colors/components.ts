// ./front/src/constants/colors/components.ts
import { base } from './base';
import { semantic } from './semantic';

export const components = {
  navbar: {
    light: {
      bg: base.primary[50],
      text: semantic.text.light.primary,
      button: {
        bg: base.gray[600],
        text: base.fixed.white,
        hover: base.gray[700],
      },
      hover: base.gray[100],
      border: base.gray[200],
    },
    dark: {
      bg: base.primary[700],
      text: base.fixed.white,
      button: {
        bg: base.gray[400],
        text: semantic.text.dark.primary,
        hover: base.gray[500],
      },
      hover: base.gray[600],
      border: base.gray[600],
    },
  },

  modal: {
    backdrop: 'rgba(0, 0, 0, 0.5)' as const,
    light: {
      bg: base.fixed.white,
      text: semantic.text.light.primary,
      hover: base.gray[100],
      border: base.gray[200],
    },
    dark: {
      bg: base.gray[800],
      text: base.fixed.white,
      hover: base.gray[700],
      border: base.gray[600],
    },
  },

  dots: {
    client: base.accent.purple,
    forwarder: base.accent.skyBlue,
    carrier: base.accent.lime,
    anonymous: base.status.error.DEFAULT,
    cookies: base.status.warning.DEFAULT,
    registered: base.status.success.DEFAULT,
    inactive: base.gray[500],
  },
} as const;

export type ComponentColors = typeof components;