import { vi } from 'vitest';

export interface MockedConsole {
  log: ReturnType<typeof vi.spyOn>;
  error: ReturnType<typeof vi.spyOn>;
  warn: ReturnType<typeof vi.spyOn>;
  info: ReturnType<typeof vi.spyOn>;
  debug: ReturnType<typeof vi.spyOn>;
}

// Console Mock Factory
export const createConsoleMock = (): MockedConsole => ({
  log: vi.spyOn(console, 'log').mockImplementation(vi.fn()),
  error: vi.spyOn(console, 'error').mockImplementation(vi.fn()),
  warn: vi.spyOn(console, 'warn').mockImplementation(vi.fn()),
  info: vi.spyOn(console, 'info').mockImplementation(vi.fn()),
  debug: vi.spyOn(console, 'debug').mockImplementation(vi.fn()),
});

// Global Console Mock Instance
export const mockConsole = createConsoleMock();

// Console Mock Utilities
export const ConsoleMockUtils = {
  // Reset all console mocks
  resetAll: (): void => {
    Object.values(mockConsole).forEach((method) => {
      if (vi.isMockFunction(method)) {
        method.mockReset();
        method.mockImplementation(vi.fn());
      }
    });
  },

  // Clear all console mock call history
  clearAll: (): void => {
    Object.values(mockConsole).forEach((method) => {
      if (vi.isMockFunction(method)) {
        method.mockClear();
      }
    });
  },

  // Get all console calls (for debugging)
  getAllCalls: () => ({
    log: mockConsole.log.mock.calls,
    error: mockConsole.error.mock.calls,
    warn: mockConsole.warn.mock.calls,
    info: mockConsole.info.mock.calls,
    debug: mockConsole.debug.mock.calls,
  }),

  // Verify specific console messages
  verifyLogMessage: (message: string): boolean => {
    return mockConsole.log.mock.calls.some((call) =>
      call.some((arg) => typeof arg === 'string' && arg.includes(message))
    );
  },

  // Verify error messages
  verifyErrorMessage: (message: string): boolean => {
    return mockConsole.error.mock.calls.some((call) =>
      call.some((arg) => typeof arg === 'string' && arg.includes(message))
    );
  },
};
