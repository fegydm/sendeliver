// ./front/src/constants/colors/base.ts
export const base = {
  primary: {
    50: '#dbeafe',
    100: '#bfdbfe',
    200: '#93c5fd',
    300: '#60a5fa',
    400: '#3b82f6',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#1e3a8a',
  },

  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  status: {
    success: {
      light: '#4CC417' as const,
      DEFAULT: '#008000' as const,
      dark: '#006400' as const,
    },
    error: {
      light: '#FF6B6B' as const,
      DEFAULT: '#FF0000' as const,
      dark: '#CC0000' as const,
    },
    warning: {
      light: '#FFB74D' as const,
      DEFAULT: '#FFA500' as const,
      dark: '#F57C00' as const,
    },
    info: {
      light: '#87CEEB' as const,
      DEFAULT: '#0288D1' as const,
      dark: '#01579B' as const,
    },
  },

  accent: {
    purple: '#FF00FF' as const,
    skyBlue: '#87CEEB' as const,
    lime: '#4CC417' as const,
  },

  fixed: {
    white: '#FFFFFF' as const,
    black: '#000000' as const,
    transparent: 'transparent' as const,
  },
} as const;

export type BaseColors = typeof base;