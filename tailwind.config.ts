import type { Config } from 'tailwindcss'
import { BRAND } from './lib/brand'

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
          DEFAULT: BRAND.colors.primary,
          dark: BRAND.colors.dark,
          light: BRAND.colors.light,
        },
      },
    },
  },
  plugins: [],
} satisfies Config
