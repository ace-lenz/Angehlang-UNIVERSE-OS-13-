/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace'],
      },
      colors: {
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}
