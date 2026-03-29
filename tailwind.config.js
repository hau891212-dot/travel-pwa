/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F7F4EB",
          blue: "#4BA3E3",
          green: "#78B394",
          yellow: "#F9E58B",
          text: "#4A8B82",
          brown: "#8D775F",
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}