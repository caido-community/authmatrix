import type { Config } from 'tailwindcss'
import theme from '@caido/tailwindcss';

export default {
  theme: theme,
  content: ['./index.html', './src/**/*.{vue,ts}'],

  // Disable preflight to avoid conflicts when loaded in Caido
  //preflight: false,
} satisfies Config
