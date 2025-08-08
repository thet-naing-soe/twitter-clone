/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Multiple projects with per-project test config
    projects: [
      {
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.tsx'],
          include: ['{app,components,lib}/**/*.{test,spec}.{ts,tsx}'],
          environmentOptions: { jsdom: { url: 'http://localhost/' } },
          exclude: ['node_modules', '.next', 'dist', 'e2e'],
        },
      },
      {
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['**/*.node.test.{ts,tsx}'],
          exclude: ['node_modules', '.next', 'dist', 'e2e'],
        },
      },
    ],

    // Coverage applies across all projects
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', 'node_modules/**', '.next/**', 'e2e/**'],
    },
  },
})
