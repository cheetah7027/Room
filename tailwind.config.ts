import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#990b47", // Dark Raspberry
          foreground: "#ffffff",
          pressed: "#80093b",
        },
        ink: {
          DEFAULT: "#2b3364", // Twilight Indigo
          muted: "rgba(43, 51, 100, 0.72)",
          faint: "rgba(43, 51, 100, 0.4)",
        },
        canvas: "#ffffff",
        "inverse-canvas": "#2b3364",
        "inverse-ink": "#ffffff",
        "on-inverse-soft": "rgba(255, 255, 255, 0.16)",
        hairline: {
          DEFAULT: "#e8e1df",
          soft: "#f1eae7",
        },
        surface: {
          soft: "#f7eee9", // Warm Seashell
        },
        block: {
          lime: "#fff49d", // Light Gold
          lilac: "#adbaff", // Soft Periwinkle
          cream: "#f7eee9", // Soft Seashell
          pink: "#adbaff",
          mint: "#f7eee9",
          coral: "#fff49d",
          navy: "#2b3364",
        },
        accent: {
          magenta: "#990b47",
        },
        semantic: {
          success: "#287a57",
          error: "#b42318",
          warning: "#b54708",
          info: "#175cd3",
        },
        overlay: {
          scrim: "rgba(43, 51, 100, 0.6)",
        },
      },
      borderRadius: {
        xs: "2px",
        sm: "6px",
        md: "8px",
        lg: "24px",
        xl: "32px",
        pill: "50px",
        full: "9999px",
      },
      spacing: {
        hair: "1px",
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      fontFamily: {
        sans: [
          "var(--font-funnel-display)",
          "Funnel Display",
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "var(--font-funnel-display)",
          "Funnel Display",
          "-apple-system",
          "sans-serif",
        ],
        funnel: [
          "var(--font-funnel-display)",
          "Funnel Display",
          "-apple-system",
          "sans-serif",
        ],
        body: [
          "var(--font-forum)",
          "Forum",
          "Georgia",
          "serif",
        ],
        forum: [
          "var(--font-forum)",
          "Forum",
          "Georgia",
          "serif",
        ],
        fredoka: [
          "var(--font-fredoka)",
          "Fredoka",
          "sans-serif",
        ],
        mono: [
          "var(--font-fredoka)",
          "Fredoka",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 16px rgba(43, 51, 100, 0.06)",
        card: "0 2px 8px rgba(43, 51, 100, 0.04)",
        modal: "0 20px 48px rgba(43, 51, 100, 0.2)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
