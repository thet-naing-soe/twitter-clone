/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'], 
    include: ['{app,components,lib}/**/*.test.{ts,tsx}'],

    environmentOptions: { jsdom: { url: 'http://localhost/' } },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', 'node_modules/**', '.next/**', 'e2e/**'],
    },

    exclude: ['node_modules', '.next', 'dist', 'e2e'],

    environmentMatchGlobs: [['**/*.node.test.{ts,tsx}', 'node']],
  },
});
