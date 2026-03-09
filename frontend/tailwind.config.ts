import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sierra Leone inspired colors
        primary: {
          50: "#e6f4f9",
          100: "#cce9f3",
          200: "#99d3e7",
          300: "#66bcdb",
          400: "#33a6cf",
          500: "#0090c3", // Ocean blue
          600: "#00739c",
          700: "#005675",
          800: "#003a4e",
          900: "#001d27",
        },
        secondary: {
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50", // Palm green
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
        },
        accent: {
          50: "#fdf8f3",
          100: "#fcf1e7",
          200: "#f9e3cf",
          300: "#f5d5b7",
          400: "#f2c79f",
          500: "#efb987", // Warm sand
          600: "#e9a362",
          700: "#e38d3d",
          800: "#dd7718",
          900: "#b86114",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
