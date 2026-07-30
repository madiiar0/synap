/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#FAFAFA",
        surface: "#FFFFFF",
        ink: "#171717",
        sub: "#737373",
        accent: "#2563EB",
        dark: "#0A0A0A",
        darktext: "#F5F5F5",
        line: "#E7E7E7",
        darkline: "#262626",
      },
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};
