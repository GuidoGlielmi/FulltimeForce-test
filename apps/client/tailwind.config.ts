import type {Config} from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        bottom: 'inset 0 -10px 10px #00000010',
        bottomStrong: 'inset 0 -20px 10px #0002',
      },
    },
  },
  plugins: [],
} satisfies Config;
