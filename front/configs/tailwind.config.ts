// ./front/configs/tailwind.config.ts
import { Config } from 'tailwindcss';
import formsPlugin from '@tailwindcss/forms';

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Základné nastavenia
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'], // pridaný Inter font ako primárny
      },
      minWidth: {
        'screen': '320px',
      },
      screens: {
        'xs': '320px',     // pridaný extra small breakpoint
        'sm': '480px',     // upravené pre lepšiu granularitu
        'md': '620px',
        'lg': '820px',
        'xl': '1024px',    // pridaný
        '2xl': '1280px',   // pridaný
      },
      // Farby
      colors: {
        hauler: {
          primary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',  // pridaná tmavšia varianta
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
            950: '#020617',  // pridaná tmavšia varianta
          }
        },
        client: {
          primary: {
            50: '#f3faf7',
            100: '#def7ec',
            200: '#bcf0da',
            300: '#84e1bc',
            400: '#31c48d',
            500: '#0e9f6e',
            600: '#057a55',
            700: '#046c4e',
            800: '#03543f',
            900: '#014737',
            950: '#002419',  // pridaná tmavšia varianta
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
            950: '#020617',  // pridaná tmavšia varianta
          }
        },
        status: {  // pridané stavové farby
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      // Tieňovanie
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'hard': '0 8px 30px rgba(0, 0, 0, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',  // pridané inner tiene
        'inner-medium': 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.1)',
      },
      // Zaoblenie
      borderRadius: {
        'xs': '0.125rem',  // pridané
        'sm': '0.25rem',   // pridané
        'md': '0.375rem',  // pridané
        'lg': '0.5rem',    // pridané
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',  // pridané
      },
      // Typografia
      fontSize: {
        'xxs': '0.625rem',    // 10px
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '1.875rem',    // 30px
        '4xl': '2.25rem',     // 36px
        '5xl': '3rem',        // 48px
        'mega': '4.5rem',     // 72px
      },
      // Rozstupy
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',       // pridané
        '144': '36rem',       // pridané
      },
      // Animácie
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in',          // pridané
        'slide-up': 'slideUp 0.3s ease-out',       // pridané
        'slide-down': 'slideDown 0.3s ease-out',   // pridané
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Rozmazanie
      backdropBlur: {
        'none': '0',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',    // pridané
      },
      // Z-index
      zIndex: {         // pridaná z-index škála
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
      },
    },
  },
  plugins: [
    formsPlugin,
    // Základné štýly pre body
    function({ addBase }) {
      addBase({
        'body': { 
          margin: '0',
          minWidth: '320px',
          overflowX: 'auto',
          WebkitFontSmoothing: 'antialiased',    // pridané pre lepšie vykreslenie fontov
          MozOsxFontSmoothing: 'grayscale',      // pridané pre lepšie vykreslenie fontov
        },
        // Základné dark mode nastavenia
        '.dark': {
          colorScheme: 'dark',
        },
      })
    }
  ],
};

export default config;