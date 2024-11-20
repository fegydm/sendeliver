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
        content: "1200px",
        modal: "32rem", // 512px pre modálne okná
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
        navbar: {
          light: {
            bg: "#dbeafe", // svetlomodrá
            text: "#000000",
            button: {
              bg: "#000000",
              text: "#ffffff",
              hover: "#1e293b",
            },
          },
          dark: {
            bg: "#1e40af", // tmavomodrá
            text: "#ffffff",
            button: {
              bg: "#ffffff",
              text: "#1e40af",
              hover: "#e2e8f0",
            },
          },
        },
        modal: {
          backdrop: "rgba(0, 0, 0, 0.5)",
          light: {
            bg: "#ffffff",
            text: "#000000",
            hover: "#f1f5f9",
            border: "#e2e8f0",
          },
          dark: {
            bg: "#1e293b",
            text: "#ffffff",
            hover: "#334155",
            border: "#475569",
          },
        },
      },
      height: {
        navbar: "48px",
        banner: "150px",
        modal: "32rem", // 512px pre modálne okná
      },
      spacing: {
        modal: {
          padding: "1.5rem", // 24px padding pre modaly
          gap: "1rem", // 16px medzery v modaloch
          offset: "10vh", // 10% od vrchu obrazovky
        },
      },
      boxShadow: {
        navbar: "0 2px 4px rgba(0,0,0,0.1)",
        dropdown: "0 4px 6px -1px rgba(0,0,0,0.1)",
        modal: "0 8px 16px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)",
      },
      zIndex: {
        navbar: "50",
        dropdown: "40",
        modalBackdrop: "998",
        modal: "999",
      },
      borderRadius: {
        modal: "0.75rem", // 12px zaoblenie pre modaly
      },
      backdropBlur: {
        modal: "4px", // Jemné rozostrenie pozadia pre modaly
      },
      fontSize: {
        modal: {
          title: "1.5rem", // 24px pre nadpisy modalov
          text: "1rem", // 16px pre text v modaloch
        },
      },
      transitionDuration: {
        modal: "200ms", // Pre jemné animácie modalov
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
          color: "#000000",
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: "#0f172a",
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
        ":root": {
          "--modal-offset": "10vh",
          "--navbar-height": "48px",
        },
      });
    },
  ],
};
