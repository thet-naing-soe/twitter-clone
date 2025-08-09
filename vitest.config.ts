/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react({ jsxImportSource: 'react' }),
    tsconfigPaths()
  ],

  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },

  test: {
    projects: [
      {
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.tsx'],
          include: [
            '{app,components,lib}/**/*.{test,spec}.{ts,tsx}',
            '**/*.{test,spec}.{js,ts,jsx,tsx}'
          ],
          exclude: [
            'node_modules',
            'dist',
            '.next',
            'coverage',
            'playwright-report',
            '**/e2e/**',
            '**/*.spec.ts',
            '**/*.node.test.{ts,tsx}'
          ],
          environmentOptions: {
            jsdom: { url: 'http://localhost/' }
          },
        },
      },
      {
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['**/*.node.test.{ts,tsx}'],
          exclude: [
            'node_modules',
            'dist',
            '.next',
            'coverage',
            'tests',
            '**/e2e/**'
          ],
        },
      },
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}'
      ],
      exclude: [
        'node_modules/**',
        'tests/**',
        'dist/**',
        '.next/**',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        'coverage/**',
        'playwright-report/**'
      ],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
