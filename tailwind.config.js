module.exports = {
  content: [
    './front/src/**/*.{js,jsx,ts,tsx}',
    './front/public/index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ... tvoje rozšírenia
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};