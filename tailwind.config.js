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
        'heritageorange': '#F5821E',
        'almamater': '#B1B3B3',
        'cloud': '#F8FAFC',
        'clouddark': '#E8E9EB',
        'clouddarker': '#DDDEDE',
        'clouddarkest': '#D2D2D2',
        'background': '#F4F4F2',
      },
      boxShadow: {
        'glow': '0 0 10px 2px #F5821E',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        'light': {
           'primary' : '#13294B',
           'primary-focus' : '#10223d',
           'primary-content' : '#ffffff',

           'secondary' : '#FF5F05',
           'secondary-focus' : '#d45208',
           'secondary-content' : '#ffffff',

           'accent' : '#1D58A7',
           'accent-focus' : '#174582',
           'accent-content' : '#ffffff',

           'neutral' : '#C8C6C7',
           'neutral-focus' : '#9C9A9D',
           'neutral-content' : '#ffffff',

           'base-100' : '#F8FAFC',
           'base-200' : '#E8E9EB',
           'base-300' : '#DDDEDE',
           'base-content' : '#000000',

           'info' : '#009FD4',
           'success' : '#006230',
           'warning' : '#FCB316',
           'error' : '#ff5724',

          '--rounded-box': '1rem',          
          '--rounded-btn': '.5rem',        
          '--rounded-badge': '1.9rem',      

          '--animation-btn': '.25s',       
          '--animation-input': '.2s',       

          '--btn-text-case': 'lowercase',   
          '--navbar-padding': '.5rem',      
          '--border-btn': '1px',            
        },
      },
    ],
  },
}

