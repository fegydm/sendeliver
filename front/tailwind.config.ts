// ./front/tailwind.config.ts
import formsPlugin from "@tailwindcss/forms";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      container: {
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
      width: {
        full: "100%",
        min: "320px",
        max: "1280px",
      },
      maxWidth: {
        content: "1200px", // Nastavenie maximálnej šírky pre obsah
      },
      screens: {
        xs: "320px",
        sm: "480px",
        md: "620px",
        lg: "820px",
        xl: "1024px",
        "2xl": "1280px",
      },
      colors: {
        gray: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        magenta: {
          100: "#ffe0ff",
          300: "#ff80ff",
          500: "#ff00ff",
          700: "#b200b2",
        },
      },
      height: {
        navbar: "48px", // Výška navigácie
        banner: "150px", // Výška banneru
      },
      padding: {
        navigation: "4px",
        banner: "10px",
      },
    },
  },
  plugins: [
    formsPlugin,
    function ({ addBase }: { addBase: Function }) {
      addBase({
        html: {
          height: "100%",
          margin: "0",
          padding: "0",
          backgroundColor: "#ffffff",
          color: "#000000", // Základná farba textu
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: "#0f172a", // Tmavý režim
            color: "#f8fafc",
          },
        },
        body: {
          margin: "0",
          padding: "0",
          minWidth: "320px",
          minHeight: "100%",
        },
        "#root": {
          minHeight: "100vh",
          position: "relative",
        },
      });
    },
  ],
};
