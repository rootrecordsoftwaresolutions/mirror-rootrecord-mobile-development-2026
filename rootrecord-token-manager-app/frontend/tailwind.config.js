module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ["IBM Plex Sans", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        bg: {
          base: "#07090C",
          surface: "#0F141A",
          elevated: "#161D26",
          raised: "#1B2430",
        },
        ink: {
          primary: "#E9F4F0",
          secondary: "#9BB2A9",
          tertiary: "#5C6F6A",
        },
        phos: {
          DEFAULT: "#14F195",
          dim: "#0DA66B",
          deep: "#064E36",
          glow: "rgba(20,241,149,0.18)",
        },
        magenta: {
          DEFAULT: "#DC1FFF",
          dim: "#8C0FB8",
          glow: "rgba(220,31,255,0.18)",
        },
        amber: { DEFAULT: "#FFB020" },
        rose: { DEFAULT: "#FF5577" },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 2px 10px rgba(0,0,0,0.35)",
        phos: "0 0 0 1px rgba(20,241,149,0.25), 0 6px 24px rgba(20,241,149,0.12)",
      },
    },
  },
  plugins: [],
};
