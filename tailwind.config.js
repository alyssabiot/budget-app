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
        },
        cat: {
          income:    { solid: 'oklch(var(--cat-income-solid))',    soft: 'oklch(var(--cat-income-soft))',    ink: 'oklch(var(--cat-income-ink))' },
          expense:   { solid: 'oklch(var(--cat-expense-solid))',   soft: 'oklch(var(--cat-expense-soft))',   ink: 'oklch(var(--cat-expense-ink))' },
          savings:   { solid: 'oklch(var(--cat-savings-solid))',   soft: 'oklch(var(--cat-savings-soft))',   ink: 'oklch(var(--cat-savings-ink))' },
          remaining: { solid: 'oklch(var(--cat-remaining-solid))', soft: 'oklch(var(--cat-remaining-soft))', ink: 'oklch(var(--cat-remaining-ink))' },
          total:     { solid: 'oklch(var(--cat-total-solid))',     soft: 'oklch(var(--cat-total-soft))',     ink: 'oklch(var(--cat-total-ink))' },
        },
      },
    },
  },
  plugins: [],
}
