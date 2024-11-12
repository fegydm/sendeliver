// ./front/configs/tailwind.config.js

const formsPlugin = require('@tailwindcss/forms');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      minWidth: {
        screen: '320px',
      },
      maxWidth: {
        screen: '1280px', // maximálna šírka celej aplikácie
        container: '1280px', // maximálna šírka content containera
      },
      screens: {
        xs: '320px',
        sm: '480px',
        md: '620px',
        lg: '820px',
        xl: '1024px',
        '2xl': '1280px',
      },
      colors: {
        // Global grayscale color scale
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
          950: '#020617',
        },
        // Project-specific color schemes
        hauler: {
          primary: {
            DEFAULT: '#ec4899',
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
            950: '#500724',
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
            950: '#020617',
          },
        },
        client: {
          primary: {
            DEFAULT: '#0e9f6e',
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
            950: '#002419',
          },
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      height: {
        navbar: '48px',
        banner: '150px',
        'banner-inner': '130px',
      },
      maxHeight: {
        navbar: '48px',
      },
      padding: {
        navigation: '4px',
        banner: '10px',
        container: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      boxShadow: {
        soft: '0 2px 15px rgba(0, 0, 0, 0.05)',
        medium: '0 4px 20px rgba(0, 0, 0, 0.1)',
        hard: '0 8px 30px rgba(0, 0, 0, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'inner-medium': 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      fontSize: {
        xxs: '0.625rem',
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        mega: '4.5rem',
        banner: '1.125rem',
      },
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
        128: '32rem',
        144: '36rem',
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
      backdropBlur: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      zIndex: {
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        auto: 'auto',
      },
    },
  },
  plugins: [
    formsPlugin,
    function ({ addBase }) {
      addBase({
        html: {
          height: '100%',
          margin: '0',
          padding: '0',
          backgroundColor: '#ffffff', // default white background for body
        },
        body: {
          margin: '0',
          padding: '0',
          minWidth: '320px',
          minHeight: '100%',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none', // Helps with bounce effect on Safari
        },
        '#root': {
          minHeight: '100vh',
          paddingTop: '48px', // navbar height
          position: 'relative',
        },
        main: {
          marginTop: '48px', // navbar height
        },
        '.dark': {
          colorScheme: 'dark',
          '--bg-color': '#020617', // gray-950 for dark mode
        },
        ':root': {
          '--bg-color': '#ffffff', // white for light mode
        },
      });
    },
  ],
};
