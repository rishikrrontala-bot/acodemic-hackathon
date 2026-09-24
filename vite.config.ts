import { defineConfig } from 'vite';

// Relative base so the site keeps working if the repo (and so the Pages path) is renamed.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 2048,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
} as never);
