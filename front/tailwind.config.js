// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Hlavná paleta pre dopravcov (ľavá strana)
          hauler: {
            // Magenta odtiene
            primary: {
              50: '#fdf2f8',
              100: '#fce7f3',
              200: '#fbcfe8',
              300: '#f9a8d4',
              400: '#f472b6',
              500: '#ec4899',  // základná magenta
              600: '#db2777',
              700: '#be185d',
              800: '#9d174d',
              900: '#831843',
            },
            // Sivé odtiene
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
            }
          },
  
          // Hlavná paleta pre klientov (pravá strana)
          client: {
            // Jablková zelená
            primary: {
              50: '#f3faf7',
              100: '#def7ec',
              200: '#bcf0da',
              300: '#84e1bc',
              400: '#31c48d',
              500: '#0e9f6e',  // základná zelená
              600: '#057a55',
              700: '#046c4e',
              800: '#03543f',
              900: '#014737',
            },
            // Sivé odtiene (rovnaké ako pre dopravcov)
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
            }
          }
        },
        // Rozšírenie pre tieňovanie
        boxShadow: {
          'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
          'medium': '0 4px 20px rgba(0, 0, 0, 0.1)',
          'hard': '0 8px 30px rgba(0, 0, 0, 0.15)',
        },
        // Rozšírenie pre border radius
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
          '3xl': '2rem',
        },
        // Rozšírenie pre fontsize
        fontSize: {
          'xxs': '0.625rem',
          'mega': '4.5rem',
        },
        // Rozšírenie pre spacing
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),  // Pre lepšie štýlovanie formulárov
    ],
  }