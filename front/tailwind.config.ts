// ./front/tailwind.config.ts
import formsPlugin from "@tailwindcss/forms";

const colors = {
  navbar: {
    light: {
      bg: "#dbeafe",
      text: "#000000",
      button: {
        bg: "#475569",
        text: "#ffffff",
        hover: "#334155",
      },
    },
    dark: {
      bg: "#1e40af",
      text: "#ffffff",
      button: {
        bg: "#94a3b8",
        text: "#1e293b",
        hover: "#64748b",
      },
    },
  },
  dots: {
    client: "#FF00FF",
    forwarder: "#87CEEB",
    carrier: "#4CC417",
    anonymous: "#FF0000",
    cookies: "#FFA500",
    registered: "#008000",
    inactive: "#808080",
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
};

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors,
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
        modal: "32rem",
      },
      screens: {
        xs: "320px",
        sm: "480px",
        md: "620px",
        lg: "820px",
        xl: "1024px",
        "2xl": "1280px",
      },
      height: {
        navbar: "48px",
        banner: "150px",
        modal: "32rem",
      },
      spacing: {
        modal: {
          outer: "2rem",
          inner: "1.5rem",
          sides: "1rem",
          gap: "1rem",
          close: "1rem",
          top: "10vh",
        },
      },
      zIndex: {
        navbar: "50",
        dropdown: "40",
        modalBackdrop: "998",
        modal: "999",
      },
      boxShadow: {
        navbar: "0 2px 4px rgba(0,0,0,0.1)",
        dropdown: "0 4px 6px -1px rgba(0,0,0,0.1)",
        modal: "0 8px 16px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        modal: "0.75rem",
      },
      backdropBlur: {
        modal: "4px",
      },
      fontSize: {
        modal: {
          title: "1.5rem",
          text: "1rem",
        },
      },
      transitionDuration: {
        modal: "200ms",
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
          scrollBehavior: "smooth",
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
          overscrollBehavior: "contain",  // for windows
          WebkitOverflowScrolling: "touch"  // for iOS
        },
        "#root": {
          minHeight: "100vh",
          position: "relative",
        },
        ":root": {
          "--modal-top-offset": "10vh",
          "--navbar-height": "48px",
        },
      });
    },
  ],
} as const;