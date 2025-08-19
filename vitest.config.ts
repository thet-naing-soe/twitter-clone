import react from '@vitejs/plugin-react';
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    reporters: process.env.GITHUB_ACTIONS ? ['verbose', 'github-actions'] : ['verbose'],

    root: __dirname,
    globals: true,
    passWithNoTests: true,
    // Global timeout
    testTimeout: 60000,
    hookTimeout: 90000,

    // Worker settings
    maxWorkers: process.env.CI ? 2 : undefined,
    minWorkers: process.env.CI ? 1 : undefined,

    poolOptions: {
      threads: {
        maxThreads: process.env.CI ? 2 : undefined,
        minThreads: process.env.CI ? 1 : undefined,
      },
    },
    // Worker timeout
    teardownTimeout: 30000,

    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './'),
          },
        },
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./tests/shared/setup/unit.setup.ts'],

          include: [
            'app/**/*.{test,spec}.{ts,tsx}',
            'components/**/*.{test,spec}.{ts,tsx}',
            'lib/**/*.{test,spec}.{ts,tsx}',
            'utils/**/*.{test,spec}.{ts,tsx}',
            'prisma/**/*.{test,spec}.{ts,tsx}',
          ],
          exclude: [
            '**/*.integration.{test,spec}.{ts,tsx}',
            '**/node_modules/**',
            '**/*.config.{ts,js}',
          ],
          testTimeout: 15_000,
          pool: 'threads',
          poolOptions: {
            threads: {
              singleThread: true,
              isolate: true,
            },
          },

          environmentOptions: {
            jsdom: {
              resources: 'usable',
              runScripts: 'dangerously',
            },
          },
        },
      },
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './'),
          },
        },
        test: {
          name: 'integration',
          environment: 'node',
          setupFiles: ['./tests/shared/setup/integration.setup.ts'],
          include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['tests/unit/**', '**/node_modules/**', '**/*.unit.{test,spec}.{ts,tsx}'],

          testTimeout: 120_000, // 2 minutes for individual tests
          hookTimeout: 180_000, // 3 minutes for hooks
          pool: 'forks',
          poolOptions: {
            forks: {
              singleFork: true,
              isolate: true,
            },
          },
          retry: 1,
        },
      },
    ],

    coverage: {
      provider: 'v8',

      reporter: process.env.CI ? ['text', 'json-summary', 'lcov'] : ['text', 'html', 'json'],

      // thresholds: {
      //   global: {
      //     statements: 40,
      //     branches: 50,
      //     functions: 70,
      //     lines: 40,
      //   },

      //   './app/page.tsx': {
      //     statements: 100,
      //     branches: 100,
      //     functions: 100,
      //     lines: 100,
      //   },
      //   './app/layout.tsx': {
      //     statements: 60,
      //     branches: 70,
      //     functions: 100,
      //     lines: 60,
      //   },
      // },

      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'prisma/**/*.{ts,tsx}',
      ],

      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.{test,spec}.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/types/**',
        'app/globals.css',
        'tailwind.config.js',
        'postcss.config.js',
        'next.config.js',
        '.next/**',
        'out/**',
        'public/**',
        'prisma/migrations/**',
        'lib/prisma.ts',
      ],

      reportsDirectory: './coverage',

      all: true,
      skipFull: false,

      clean: true,
      cleanOnRerun: true,
    },

    // Watch mode configuration
    watch: process.env.WATCH === 'true',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**', '**/.git/**'],

    // Performance optimization
    isolate: true,

    // Development experience improvements
    clearMocks: true,
    restoreMocks: true,
  },
});
