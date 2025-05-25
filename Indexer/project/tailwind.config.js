/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#B026FF',
        'dark': {
          600: '#2D2D3A',
          800: '#1F1F2C',
          900: '#13131A',
        }
      },
      boxShadow: {
        'neon-sm': '0 0 5px rgba(176, 38, 255, 0.5)',
        'neon-md': '0 0 15px rgba(176, 38, 255, 0.5)',
      }
    },
  },
  plugins: [],
}