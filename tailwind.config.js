/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0c0a14',
        cardDark: '#161325',
        cardDarkHover: '#1f1b36',
        accentPurple: '#7c3aed',
        accentPurpleHover: '#6d28d9',
      },
    },
  },
  plugins: [],
}