import { afterEach, beforeEach, vi } from 'vitest';

import { ConsoleMockUtils, mockConsole } from '../mocks/console.mock';
import { FakerMockUtils, mockFaker } from '../mocks/faker.mock';
import { mockPrisma, PrismaMockUtils } from '../mocks/prisma.mock';

// Global Test Hooks
beforeEach(() => {
  // Clear all mock call histories (preserves implementation)
  PrismaMockUtils.clearAll();
  ConsoleMockUtils.clearAll();

  // Set deterministic faker seed for predictable results
  FakerMockUtils.setSeed(123);

  // Setup default successful mock responses
  PrismaMockUtils.setupSuccessDefaults();
});

afterEach(() => {
  // Reset all mocks to original implementations
  PrismaMockUtils.resetAll();
  FakerMockUtils.resetAll();
  ConsoleMockUtils.resetAll();

  // Clear any remaining timers or async operations
  vi.useRealTimers();

  // Restore any modified global objects
  vi.unstubAllGlobals();
});

// Centralized access to all test utilities
export const TestUtils = {
  mocks: {
    prisma: mockPrisma,
    faker: mockFaker,
    console: mockConsole,
  },
  utils: {
    prisma: PrismaMockUtils,
    faker: FakerMockUtils,
    console: ConsoleMockUtils,
  },
} as const;

// Test Metrics & Debugging
export const TestMetrics = {
  // Get test execution summary
  getSummary: () => ({
    prismaCalls: {
      userCreate: mockPrisma.user.create.mock.calls.length,
      tweetCreate: mockPrisma.tweet.create.mock.calls.length,
      followCreate: mockPrisma.follow.create.mock.calls.length,
      likeCreate: mockPrisma.like.create.mock.calls.length,
    },
    consoleCalls: ConsoleMockUtils.getAllCalls(),
  }),

  // Debug helper for test failures
  debugTest: (testName: string) => {
    console.log(`🐛 Debug info for test: ${testName}`);
    console.log('📊 Mock call summary:', TestMetrics.getSummary());
  },
};
