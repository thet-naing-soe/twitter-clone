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
    testTimeout: 60000,
    hookTimeout: 90000,
    maxWorkers: process.env.CI ? 2 : undefined,
    minWorkers: process.env.CI ? 1 : undefined,
    poolOptions: {
      threads: {
        maxThreads: process.env.CI ? 2 : undefined,
        minThreads: process.env.CI ? 1 : undefined,
      },
    },
    teardownTimeout: 30000,
    isolate: true,
    clearMocks: true,
    restoreMocks: true,

    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './'),
          },
        },
        test: {
          name: 'frontend:unit',
          environment: 'jsdom',
          setupFiles: ['./tests/setup/frontend.setup.ts'],
          include: [
            'app/**/*.unit.{test,spec}.{ts,tsx}',
            'components/**/*.unit.{test,spec}.{ts,tsx}',
          ],
          exclude: ['**/node_modules/**', '**/*.config.{ts,js}'],
          testTimeout: 15_000,
          pool: 'threads',
          poolOptions: {
            threads: { singleThread: true, isolate: true },
          },
          environmentOptions: {
            jsdom: { resources: 'usable', runScripts: 'dangerously' },
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
          name: 'frontend:integration',
          environment: 'jsdom',
          setupFiles: [
            './tests/setup/frontend.setup.ts', // UI mocks
            './tests/setup/msw.setup.ts', // API mocks
          ],
          include: [
            'app/**/*.integration.{test,spec}.{ts,tsx}',
            'components/**/*.integration.{test,spec}.{ts,tsx}',
          ],
          exclude: ['**/node_modules/**', '**/*.config.{ts,js}'],
          testTimeout: 25_000,
          pool: 'threads',
          poolOptions: {
            threads: { singleThread: true, isolate: true },
          },
          environmentOptions: {
            jsdom: { resources: 'usable', runScripts: 'dangerously' },
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
          name: 'backend:unit',
          environment: 'node',
          setupFiles: ['./tests/setup/backend-unit.setup.ts'],
          include: [
            'lib/**/*.unit.{test,spec}.ts',
            'utils/**/*.unit.{test,spec}.ts',
            'prisma/**/*.unit.{test,spec}.ts',
          ],
          exclude: ['**/node_modules/**', '**/*.config.{ts,js}'],
          testTimeout: 15_000,
          pool: 'threads',
          poolOptions: {
            threads: { singleThread: true, isolate: true },
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
          name: 'backend:integration',
          environment: 'node',
          setupFiles: ['./tests/setup/backend-integration.setup.ts'],
          include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['**/node_modules/**', '**/*.config.{ts,js}'],

          testTimeout: 120_000,
          hookTimeout: 180_000,
          pool: 'forks',
          poolOptions: {
            forks: { singleFork: true, isolate: true },
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
    watch: process.env.WATCH === 'true',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**', '**/.git/**'],
  },
});
