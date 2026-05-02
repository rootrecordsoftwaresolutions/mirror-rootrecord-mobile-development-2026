/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        // Account Hub: dark "pearl" theme with amber brand — intentionally distinct from
        // Weather (#3FE28D green) and Business (#2B8A8F teal).
        bg: { base: "#0B0D12", surface: "#141821", elevated: "#1D2230" },
        ink: { primary: "#F5F3EE", secondary: "#A6A39A", tertiary: "#6B6A63" },
        brand: {
          DEFAULT: "#E9B949",
          light: "#F4CE6B",
          dark: "#B8902E",
          subtle: "rgba(233,185,73,0.12)",
        },
        // Cross-brand tints used by the Connected Apps cards
        weather: "#3FE28D",
        business: "#2B8A8F",
        ok: "#10B981",
        warn: "#F59E0B",
        danger: "#F43F5E",
        info: "#60A5FA",
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.06)",
        strong: "rgba(255,255,255,0.12)",
      },
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
      boxShadow: { card: "0 2px 12px rgba(0,0,0,0.35)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
