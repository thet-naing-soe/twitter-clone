import { vi } from 'vitest';

export interface MockedFaker {
  readonly internet: {
    userName: ReturnType<typeof vi.fn>;
    email: ReturnType<typeof vi.fn>;
  };
  readonly person: {
    fullName: ReturnType<typeof vi.fn>;
  };
  readonly lorem: {
    sentence: ReturnType<typeof vi.fn>;
    word: ReturnType<typeof vi.fn>;
    words: ReturnType<typeof vi.fn>;
  };
  readonly image: {
    avatar: ReturnType<typeof vi.fn>;
    url: ReturnType<typeof vi.fn>;
  };
  readonly datatype: {
    boolean: ReturnType<typeof vi.fn>;
  };
  readonly number: {
    int: ReturnType<typeof vi.fn>;
  };
  readonly helpers: {
    arrayElement: ReturnType<typeof vi.fn>;
    arrayElements: ReturnType<typeof vi.fn>;
  };
  readonly hacker: {
    phrase: ReturnType<typeof vi.fn>;
  };
  readonly company: {
    buzzPhrase: ReturnType<typeof vi.fn>;
  };
  readonly seed: ReturnType<typeof vi.fn>;
}

// Creates deterministic faker mock with predictable outputs
export const createFakerMock = () => ({
  internet: {
    userName: vi.fn().mockReturnValue('mockuser'),
    email: vi.fn().mockReturnValue('mock@example.com'),
  },
  person: {
    fullName: vi.fn().mockReturnValue('Mock User'),
  },
  lorem: {
    sentence: vi.fn().mockReturnValue('Mock sentence for testing'),
    word: vi.fn().mockReturnValue('mockword'),
    words: vi.fn().mockReturnValue('mock words'),
  },
  image: {
    avatar: vi.fn().mockReturnValue('https://mock.com/avatar.jpg'),
    url: vi.fn().mockReturnValue('https://mock.com/image.jpg'),
  },
  datatype: {
    boolean: vi.fn().mockReturnValue(false),
  },
  number: {
    int: vi.fn().mockReturnValue(1), // ensure within range
  },
  helpers: {
    arrayElement: vi.fn().mockImplementation(<T>(arr: readonly T[]): T => arr[0]),
    arrayElements: vi
      .fn()
      .mockImplementation(<T>(arr: readonly T[], count: number): T[] => arr.slice(0, count)),
  },
  hacker: {
    phrase: vi.fn().mockReturnValue('hacking the matrix'),
  },
  company: {
    buzzPhrase: vi.fn().mockReturnValue('revolutionary synergy'),
  },
  seed: vi.fn(),
});

// Global Faker Mock Instance
export const mockFaker = createFakerMock();

// Faker Mock Utilities
export const FakerMockUtils = {
  // Reset all faker mocks
  resetAll: (): void => {
    Object.values(mockFaker).forEach((category) => {
      if (typeof category === 'object') {
        Object.values(category).forEach((method) => {
          if (vi.isMockFunction(method)) {
            method.mockReset();
          }
        });
      } else if (vi.isMockFunction(category)) {
        category.mockReset();
      }
    });
  },

  // Setup deterministic seed
  setSeed: (_seed = 123): void => {
    mockFaker.seed.mockImplementation(() => {
      // Simulate seeding by making subsequent calls more predictable
      let counter = 0;
      mockFaker.internet.userName.mockImplementation(() => `user${counter++}`);
      mockFaker.internet.email.mockImplementation(() => `user${counter}@example.com`);
    });
  },

  // Setup probabilistic behaviors
  setupProbabilistic: (trueRate = 0.5): void => {
    let callCount = 0;
    mockFaker.datatype.boolean.mockImplementation(() => {
      return callCount++ % (1 / trueRate) === 0;
    });
  },
};

// Module Mock Setup
vi.mock('@faker-js/faker', () => ({
  faker: mockFaker,
}));
