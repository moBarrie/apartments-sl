import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sierra Leone flag colors - Green, White, Blue
        primary: {
          50: "#e6f7ff",
          100: "#bae7ff",
          200: "#91d5ff",
          300: "#69c0ff",
          400: "#40a9ff",
          500: "#1890ff",
          600: "#0072C6", // Sierra Leone Blue
          700: "#005a9e",
          800: "#004477",
          900: "#002f4f",
        },
        // Sierra Leone Green
        green: {
          50: "#e8f9ed",
          100: "#c6f0d2",
          200: "#9fe6b5",
          300: "#77dc97",
          400: "#58d480",
          500: "#38cc69",
          600: "#1EB53A", // Sierra Leone Green
          700: "#189d32",
          800: "#138629",
          900: "#0a6318",
        },
        // Keep blue as alias for primary
        blue: {
          50: "#e6f7ff",
          100: "#bae7ff",
          200: "#91d5ff",
          300: "#69c0ff",
          400: "#40a9ff",
          500: "#1890ff",
          600: "#0072C6",
          700: "#005a9e",
          800: "#004477",
          900: "#002f4f",
        },
        // Legacy colors for backward compatibility
        ocean: {
          50: "#e6f7ff",
          100: "#bae7ff",
          200: "#91d5ff",
          300: "#69c0ff",
          400: "#40a9ff",
          500: "#1890ff",
          600: "#0072C6",
          700: "#005a9e",
          800: "#004477",
          900: "#002f4f",
        },
        palm: {
          50: "#e8f9ed",
          100: "#c6f0d2",
          200: "#9fe6b5",
          300: "#77dc97",
          400: "#58d480",
          500: "#38cc69",
          600: "#1EB53A",
          700: "#189d32",
          800: "#138629",
          900: "#0a6318",
        },
        sand: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
      },
    },
  },
  plugins: [],
};
export default config;
