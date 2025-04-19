// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class
  theme: {
    extend: {
      colors: {
        // X's color scheme
        twitter: {
          blue: '#1d9bf0',
          black: '#000000',
          dark: '#15202b',     // Dim mode background
          darker: '#1a2836',   // Dim mode secondary background
          darkText: '#f7f9f9', // Dark mode text
          light: '#ffffff',
          lightText: '#0f1419',
          gray: '#536471',
          lightGray: '#e7e9ea',
          border: '#2f3336',
          hover: '#181818',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}