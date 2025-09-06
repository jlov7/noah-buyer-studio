import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1c7ed6',
          dark: '#1864ab',
          light: '#4dabf7',
        },
      },
    },
  },
  plugins: [],
} satisfies Config

