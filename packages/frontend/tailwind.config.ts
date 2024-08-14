import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {},
  },
  content: ['./index.html', './src/**/*.{vue,ts}'],

  // Disable preflight to avoid conflicts when loaded in Caido
  //preflight: false,
} satisfies Config
