import type { Config } from 'tailwindcss';

export default {
  prefix: 'uyap-',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/popup/index.html'
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
