/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        gradient: 'gradient 6s ease infinite',
        neonGlow: 'neonGlow 2s infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': '0% 50%' },
          '50%': { 'background-size': '200% 200%', 'background-position': '100% 50%' },
        },
        neonGlow: {
          '0%': { 'box-shadow': '0 0 5px rgba(0, 200, 255, 0.3)' },
          '100%': { 'box-shadow': '0 0 20px rgba(124, 58, 237, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
