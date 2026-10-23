/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#EEF3F8",
        surface: "#FFFFFF",
        border: {
          DEFAULT: "#E4E9F0",
          soft: "#EDF1F6",
        },
        ink: {
          900: "#101828",
          700: "#344054",
          500: "#667085",
          400: "#98A2B3",
        },
        brand: {
          50: "#EAF7F6",
          100: "#D7F0EE",
          400: "#4FC7C0",
          500: "#2FB6AD",
          600: "#239E96",
          700: "#1C817B",
        },
        activeNav: "#DCEFEE",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.1rem",
      },
    },
  },
  plugins: [typography],
};
