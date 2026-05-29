/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      colors: {
        ink: {
          50:  '#f7f7f5',
          100: '#eeede8',
          200: '#d8d6ce',
          400: '#9e9b91',
          600: '#5c5a53',
          800: '#2a2925',
          900: '#181714',
        },
        accent: {
          DEFAULT: '#2563eb',
          light:   '#eff6ff',
          muted:   '#bfdbfe',
        }
      },
    },
  },
  plugins: [],
}
