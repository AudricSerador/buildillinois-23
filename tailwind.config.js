/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}",],
  theme: {
    extend: {
      fontFamily: {
        'custom': ['Source Sans Pro', ...defaultTheme.fontFamily.sans],
        'custom-bold': ['Source Sans Pro Bold', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

