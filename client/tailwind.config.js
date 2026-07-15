/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#030303',
          900: '#0a0a0c',
          800: '#121217',
          700: '#1a1a24',
          600: '#222230',
        },
        brand: {
          purple: {
            light: '#d6bcfa',
            DEFAULT: '#9f7aea',
            dark: '#805ad5',
          },
          pink: {
            light: '#fbb6ce',
            DEFAULT: '#ed64a6',
            dark: '#d53f8c',
          },
          cyan: {
            light: '#9decf9',
            DEFAULT: '#319795',
            dark: '#2c7a7b',
          }
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2.5s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
