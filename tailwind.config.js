/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'health-red': '#ef4444',
        'health-yellow': '#eab308',
        'health-green': '#22c55e',
      },
    },
  },
  plugins: [],
}
