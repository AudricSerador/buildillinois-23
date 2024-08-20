/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        'custom': ['Source Sans Pro', 'sans-serif'],
        'custombold': ['Source Sans Pro Bold', 'sans-serif'],
        'customlight': ['Source Sans Pro Light', 'sans-serif'],
        'sans': ['Source Sans Pro', 'sans-serif'],
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
        'custombg': '#f4f4f2',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#ff5724",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#C8C6C7",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#1D58A7",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#F8FAFC",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#F8FAFC",
          foreground: "#000000",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
      },
      boxShadow: {
        'glow': '0 0 10px 2px #F5821E',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
    require("tailwindcss-animate"),
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