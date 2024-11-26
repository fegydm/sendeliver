// ./front/tailwind.config.ts
import formsPlugin from "@tailwindcss/forms";
import colors, { base } from "./src/constants/colors";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: ["class", "class"],
  theme: {
  	colors: {
            ...base,
  		current: 'currentColor',
  		transparent: 'transparent',
  		text: 'colors.semantic.text',
  		bg: 'colors.semantic.background',
  		border: 'colors.semantic.border',
  		interactive: 'colors.semantic.interactive',
  		navbar: 'colors.components.navbar',
  		modal: 'colors.components.modal',
  		dots: 'colors.components.dots'
  	},
  	extend: {
  		container: {
  			padding: {
  				DEFAULT: '1rem',
  				sm: '2rem',
  				lg: '4rem',
  				xl: '5rem',
  				'2xl': '6rem'
  			}
  		},
  		fontFamily: {
  			sans: ["Inter", "Arial", "sans-serif"]
  		},
  		width: {
  			full: '100%',
  			min: '320px',
  			max: '1280px'
  		},
  		maxWidth: {
  			content: '1200px',
  			modal: '32rem'
  		},
  		screens: {
  			xs: '320px',
  			sm: '480px',
  			md: '620px',
  			lg: '820px',
  			xl: '1024px',
  			'2xl': '1280px'
  		},
  		height: {
  			navbar: '48px',
  			banner: '150px',
  			modal: '32rem'
  		},
  		spacing: {
  			modal: {
  				outer: '2rem',
  				inner: '1.5rem',
  				sides: '1rem',
  				gap: '1rem',
  				close: '1rem',
  				top: '10vh'
  			}
  		},
  		zIndex: {
  			navbar: '50',
  			dropdown: '40',
  			modalBackdrop: '998',
  			modal: '999'
  		},
  		boxShadow: {
  			navbar: '0 2px 4px rgba(0,0,0,0.1)',
  			dropdown: '0 4px 6px -1px rgba(0,0,0,0.1)',
  			modal: '0 8px 16px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)'
  		},
  		borderRadius: {
  			modal: '0.75rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backdropBlur: {
  			modal: '4px'
  		},
  		fontSize: {
  			modal: {
  				title: '1.5rem',
  				text: '1rem'
  			}
  		},
  		transitionDuration: {
  			modal: '200ms'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [
    formsPlugin,
    function ({ addBase }: { addBase: Function }) {
      addBase({
        html: {
          height: "100%",
          margin: "0",
          padding: "0",
          backgroundColor: colors.semantic.background.light.primary,
          color: colors.semantic.text.light.primary,
          scrollBehavior: "smooth",
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: colors.semantic.background.dark.primary,
            color: colors.semantic.text.dark.primary,
          },
        },
        body: {
          margin: "0",
          padding: "0",
          minWidth: "320px",
          minHeight: "100%",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch"
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
      require("tailwindcss-animate")
],
} as const;