/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        app: '#081C2B',
        container: '#0F2232',
        containerHover: '#13304A',
        elevated: '#13304A',
        subtle: '#1E3F58',
        accent: '#3FE28D',
        accentHover: '#5AF0A0',
        sev: {
          minor: '#FBBF24',
          moderate: '#F97316',
          severe: '#EF4444',
          extreme: '#991B1B',
        },
        mag: {
          low: '#94A3B8',
          mid: '#FACC15',
          high: '#F97316',
          critical: '#DC2626',
        },
      },
      animation: {
        fadein: 'fadein .3s ease-out',
        slideup: 'slideup .3s ease-out',
        spinSlow: 'spin 1.4s linear infinite',
      },
      keyframes: {
        fadein: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideup: {
          '0%': { transform: 'translateY(16px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
