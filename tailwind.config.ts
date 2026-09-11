import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        asal: {
          DEFAULT: '#00A651',
          hover: '#00873F',
          light: '#E6F7EE',
          accent: '#2E2E33',
          50: '#E6F7EE',
          100: '#C2ECD6',
          500: '#00A651',
          600: '#00873F',
          700: '#00692F'
        }
      }
    }
  },
  plugins: []
};

export default config;
