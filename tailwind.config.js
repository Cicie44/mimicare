/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy — keep for backward compat
        cream: '#FFF8F0',
        peach: '#FFCBA4',
        // New design system
        sage: {
          50:  '#F2F5F3',
          100: '#E4EBE7',
          200: '#CBD8D0',
          400: '#8BA899',
          500: '#5F7A68',
          600: '#4A6354',
          700: '#3F5748',
        },
        parchment: {
          50:  '#FFFCF7',
          100: '#F7F3EA',
          200: '#EDE7DB',
          300: '#E6DED1',
        },
        terracotta: {
          400: '#D4917B',
          500: '#C9785B',
          600: '#B5664A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
