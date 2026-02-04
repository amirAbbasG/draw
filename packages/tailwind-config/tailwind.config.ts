/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    screens: {
      xs: "420px",
      sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      "2xl": "1366px",
      "3xl": "1440px",
      "4xl": "1921px",
      "min-md": { min: "768px" },
    },
    extend: {

      fontSize: {
        xs: "0.625rem", //8px
        sm: "0.75rem", //12px
        base: "0.875rem", //14px
        DEFAULT: "0.875rem", //14px
        lg: "1rem", //16px
        xl: "1.25rem", //20px
        "2xl": "1.5rem", //24px
        "3xl": "1.75rem", //28px
        "4xl": "2rem", //32px
        "5xl": "2.25rem", //36px
        "6xl": "2.50rem", //40
        "7xl": "2.75rem", //44
        "8xl": "3rem", //48
        "9xl": "3.25rem", //52
        "10xl": "3.50rem", //56
      },
      spacing: {
        "label-space": "var(--spacing-form-label)",
        "form-padding": "var(--spacing-form-padding)",
        "gap-form": "var(--spacing-gap-form)",
        input: "var(--spacing-element-height)",
        18: "4.5rem", //72px
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        md: "0.375rem", //6px
        DEFAULT: "0.5rem", //8px
        lg: "0.75rem", //12px
        xl: "1.5rem", //24px
        "2xl": "2.25rem", //36px
        "3xl": "3rem", //48px
        none: "0",
        full: "9999px",
      },
      fontFamily: {
        dmSans: ["'DM Sans', sans-serif"],
      },
      backgroundImage: {
        //nerd: landing
        "custom-gradient":
          "linear-gradient(180deg, #07081C 0%, #9373EE 49%, #07081C 98%)",
        "landing-service": "var(--secondary-700, #1F0A58)",
        //nerd:end landing
        gradient:
          "linear-gradient(90deg, var(--brand-second) 0%, var(--brand) 100%)",
      },
      backgroundColor: {
        //nerd:start landing
        "glass-dark": "#00000040",
      },
      colors: {
        gradient: {
          start: "#52D5FF",
          end: "#9D7AFF",
        },
        highlight: "var(--highlight)",
        foreground: {
          disable: "var(--text-disable)",
          lighter: "var(--text-lighter)",
          light: "var(--text-light)",
          DEFAULT: "var(--text)",
          dark: "var(--text-dark)",
          darker: "var(--text-darker)",
          icon: "var(--text-icon)",
        },
        background: {
          lighter: "var(--bg-lighter)",
          light: "var(--bg-light)",
          DEFAULT: "var(--bg)",
          dark: "var(--bg-dark)",
          darker: "var(--bg-darker)",
        },
        muted: {
          lighter: "var(--muted-lighter)",
          light: "var(--muted-light)",
          DEFAULT: "var(--muted)",
          dark: "var(--muted-dark)",
          darker: "var(--muted-darker)",
        },
        primary: {
          lighter: "var(--primary-lighter)",
          light: "var(--primary-light)",
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          darker: "var(--primary-darker)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          lighter: "var(--secondary-lighter)",
          light: "var(--secondary-light)",
          DEFAULT: "var(--secondary)",
          dark: "var(--secondary-dark)",
          darker: "var(--secondary-darker)",
          foreground: "var(--foreground)",
        },
        danger: {
          lighter: "var(--danger-lighter)",
          light: "var(--danger-light)",
          DEFAULT: "var(--danger)",
          dark: "var(--danger-dark)",
          darker: "var(--danger-darker)",
        },
        success: {
          lighter: "var(--success-lighter)",
          light: "var(--success-light)",
          DEFAULT: "var(--success)",
          dark: "var(--success-dark)",
          darker: "var(--success-darker)",
        },
        warning: {
          lighter: "var(--warning-lighter)",
          light: "var(--warning-light)",
          DEFAULT: "var(--warning)",
          dark: "var(--warning-dark)",
          darker: "var(--warning-darker)",
        },
        info: {
          lighter: "var(--info-lighter)",
          light: "var(--info-light)",
          DEFAULT: "var(--info)",
          dark: "var(--info-dark)",
          darker: "var(--info-darker)",
        },
        overlay: {
          lighter: "var(--overlay-lighter)",
          light: "var(--overlay-light)",
          DEFAULT: "var(--overlay)",
          dark: "var(--overlay-dark)",
          darker: "var(--overlay-darker)",
        },
        orange: {
          lighter: "var(--orange-lighter)",
          light: "var(--orange-light)",
          DEFAULT: "var(--orange)",
          dark: "var(--orange-dark)",
          darker: "var(--orange-darker)",
        },
        magenta: {
          lighter: "var(--magenta-lighter)",
          light: "var(--magenta-light)",
          DEFAULT: "var(--magenta)",
          dark: "var(--magenta-dark)",
          darker: "var(--magenta-darker)",
        },
        separator: "var(--bg-dark)",
        active: "var(--primary-lighter)",
        card: {
          DEFAULT: "var(--bg-light)",
          foreground: "var(--text)",
        },
        input: "var(--bg)",
        ring: "var(--ring)",
        popover: {
          DEFAULT: "var(--bg-lighter)",
          foreground: "var(--text)",
        },
        accent: {
          DEFAULT: "var(--bg-dark)",
          foreground: "var(--text)",
        },
      },

      boxShadow: {
        modal:

          "0px 10px 18px 0px color-mix(in oklch, var(--text-light) 15%, transparent), 0px 0px 1px 0px color-mix(in oklch, var(--text-light) 15%, transparent)",
        popup: "0 16px 56px rgba(16,24,40,0.16)",
        "card-hover":
          "0px 0px 4px rgba(40,41,61,0.02),0px 2px 24px rgba(40,41,61,0.08)",
        "dashboard-card": "0px 12px 12px 0px rgba(79, 73, 85, 0.08);",
        custom: "50px 0px 100px 0px #00000040",
        "custom-landing": "0px 0px 20px 0px #9373EEC",
        "toast-shadow": "0px 6px 12px 0px #0000001A",
        island:"0px 0px 0.9310142993927002px 0px rgba(0, 0, 0, 0.17), 0px 0px 3.1270833015441895px 0px rgba(0, 0, 0, 0.08), 0px 7px 14px 0px rgba(0, 0, 0, 0.05)",
        sidebar: "0px 100px 80px rgba(0, 0, 0, 0.07), 0px 41.7776px 33.4221px rgba(0, 0, 0, 0.0503198), 0px 22.3363px 17.869px rgba(0, 0, 0, 0.0417275), 0px 12.5216px 10.0172px rgba(0, 0, 0, 0.035), 0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0282725), 0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0196802)"
      },
      keyframes: {
        bounce: {
          "0%, 20%, 50%, 80%, 100%": {
            transform: "scaleY(1)",
          },
          "40%": {
            transform: "scaleY(2)",
          },
          "60%": {
            transform: "scaleY(0.8)",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        loading: {
          "0%": {
            width: "0%",
          },
          "100%": {
            width: "100%",
          },
        },
        "blink-opacity": {
          "50%": { opacity: "0.5" },
        },
        blink: {
          "50%": { "background-color": "transparent" },
        },
        slideDownAndFade: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideUpAndFade: {
          "0%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-10px)" },
        },
        typingDots: {
          "0%, 20%": { opacity: ".2" },
          "40%": { opacity: ".6" },
          "60%, 100%": { opacity: "1" },
        },
        "shine-loading": {
          "0%": { backgroundPosition: "-250px 0" },
          "100%": { backgroundPosition: "250px 0" },
        },
        slideDown: {
          from: { height: "0px", opacity: "0" },
          to: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",
          },
        },
        slideUp: {
          from: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",
          },
          to: { height: "0px", opacity: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        loading: "loading 3s cubic-bezier(0.1, 0.8, 1, 1) infinite",
        blink: "blink 1s step-start infinite",
        "blink-opacity": "blink-opacity 1s step-start infinite",
        slideDownAndFade: "slideDownAndFade 0.3s ease-out forwards",
        slideUpAndFade: "slideUpAndFade 0.3s ease-in forwards",
        "spin-slow": "spin .3s linear infinite",
        typingDots: "typingDots 1s steps(1, end) infinite",
        "shine-loading": "shine-loading 2s infinite ease-out",
        bounce1: "bounce 0.8s infinite ease-in-out 0s",
        bounce2: "bounce 0.8s infinite ease-in-out 0.2s",
        bounce3: "bounce 0.8s infinite ease-in-out 0.4s",
        bounce4: "bounce 0.8s infinite ease-in-out 0.6s",
        bounce5: "bounce 0.8s infinite ease-in-out 0.8s",
        slideDown: "slideDown 300ms",
        slideUp: "slideUp 300ms",
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 8px 16px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [
    // require("tailwindcss-rtl"),
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    plugin(function ({
      addVariant,
    }: {
      addVariant: (name: string, generator: string) => void;
    }) {
      addVariant("selected", "&[data-selected='true']");
    }),
    //@ts-ignore
    function ({ addUtilities }) {
      addUtilities({
        ".text-shadow-custom-purple": {
          "text-shadow": "0px 0px 20px #9373EECC",
        },
      });
    },
  ],
};
