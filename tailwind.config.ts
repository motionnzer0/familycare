import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: {
          DEFAULT: "var(--color-surface)",
          subtle: "var(--color-surface-subtle)",
        },
        border: "var(--color-border)",
        content: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          subtle: "var(--color-text-subtle)",
        },
        brand: {
          DEFAULT: "var(--color-primary-700)",
          light: "var(--color-primary-100)",
          700: "var(--color-primary-700)",
          100: "var(--color-primary-100)",
        },
        focus: "var(--color-focus)",
        danger: {
          DEFAULT: "var(--color-danger-700)",
          700: "var(--color-danger-700)",
          100: "var(--color-danger-100)",
        },
        warning: {
          DEFAULT: "var(--color-warning-800)",
          800: "var(--color-warning-800)",
          100: "var(--color-warning-100)",
        },
        success: {
          DEFAULT: "var(--color-success-800)",
          800: "var(--color-success-800)",
          100: "var(--color-success-100)",
        },
        info: {
          DEFAULT: "var(--color-info-800)",
          800: "var(--color-info-800)",
          100: "var(--color-info-100)",
        },
      },
      fontFamily: {
        sans: [
          "Source Sans 3",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        sm: "4px",
      },
      maxWidth: {
        app: "1280px",
        reading: "720px",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
