/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}",],
  theme: {
    extend: {
      fontFamily: {
        'custom': ['Source Sans Pro', ...defaultTheme.fontFamily.sans],
        'custombold': ['Source Sans Pro Bold', ...defaultTheme.fontFamily.sans],
        'customlight': ['Source Sans Pro Light', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'uiucblue': '#13294B',
        'uiucorange': '#FF5F05',
      },
    },
  },
  plugins: [],
}

