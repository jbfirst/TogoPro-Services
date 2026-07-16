/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        terracotta: { DEFAULT: "#C1440E", dark: "#9A3609" },
        ocre: { DEFAULT: "#E3A857", light: "#F3D9A4" },
        green: { DEFAULT: "#2F6B4F", dark: "#204B37" },
        gold: "#D4AF37",
        cream: "#FDF7EC",
        sand: "#F7EDDD",
        ink: { DEFAULT: "#2B2320", soft: "#6B5E52" },
        danger: "#B3261E",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
        control: "12px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(43,35,32,0.08)",
      },
    },
  },
  plugins: [],
};
