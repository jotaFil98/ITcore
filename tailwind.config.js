/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emeraldDark: '#062821',
        emeraldCard: '#ffffff',
        emeraldAccent: '#10b981',
        emeraldAccentHover: '#059669',
      },
    },
  },
  plugins: [],
}