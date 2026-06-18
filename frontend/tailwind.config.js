/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark background palette (from prototype)
        bg: {
          base: '#0c0e16',
          card: '#141720',
          elevated: '#1e2235',
          surface: '#13161f',
        },
        border: {
          subtle: 'rgba(255,255,255,0.07)',
          muted: 'rgba(255,255,255,0.04)',
        },
        // Brand accents
        indigo: { DEFAULT: '#6366f1', light: '#818cf8' },
        teal: { DEFAULT: '#2dd4bf' },
        amber: { DEFAULT: '#f59e0b' },
        emerald: { DEFAULT: '#22c55e' },
        rose: { DEFAULT: '#f43f5e' },
        // Text
        text: {
          primary: '#f1f5f9',
          secondary: '#e2e8f0',
          muted: '#94a3b8',
          faint: '#64748b',
          ghost: '#475569',
          deep: '#334155',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '20px',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
