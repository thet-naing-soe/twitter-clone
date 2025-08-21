import type { Follow, Like, Tweet, User } from '@prisma/client';
import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';

// Individual Model Mock Interfaces
interface MockedPrismaUser {
  create: MockedFunction<(args: { data: Partial<User> }) => Promise<User>>;
  update: MockedFunction<(args: { where: Partial<User>; data: Partial<User> }) => Promise<User>>;
  findMany: MockedFunction<
    (args?: { where?: Partial<User>; orderBy?: Record<string, unknown> }) => Promise<User[]>
  >;
  findFirst: MockedFunction<(args?: { where?: Partial<User> }) => Promise<User | null>>;
  count: MockedFunction<(args?: { where?: Partial<User> }) => Promise<number>>;
  delete: MockedFunction<(args: { where: Partial<User> }) => Promise<User>>;
}

interface MockedPrismaTweet {
  create: MockedFunction<(args: { data: Partial<Tweet> }) => Promise<Tweet>>;
  update: MockedFunction<(args: { where: Partial<Tweet>; data: Partial<Tweet> }) => Promise<Tweet>>;
  findMany: MockedFunction<
    (args?: { where?: Partial<Tweet>; orderBy?: Record<string, unknown> }) => Promise<Tweet[]>
  >;
  findFirst: MockedFunction<(args?: { where?: Partial<Tweet> }) => Promise<Tweet | null>>;
  count: MockedFunction<(args?: { where?: Partial<Tweet> }) => Promise<number>>;
  delete: MockedFunction<(args: { where: Partial<Tweet> }) => Promise<Tweet>>;
}

interface MockedPrismaFollow {
  create: MockedFunction<(args: { data: Partial<Follow> }) => Promise<Follow>>;
  findMany: MockedFunction<
    (args?: { where?: Partial<Follow>; orderBy?: Record<string, unknown> }) => Promise<Follow[]>
  >;
  count: MockedFunction<(args?: { where?: Partial<Follow> }) => Promise<number>>;
  delete: MockedFunction<(args: { where: Partial<Follow> }) => Promise<Follow>>;
}

interface MockedPrismaLike {
  create: MockedFunction<(args: { data: Partial<Like> }) => Promise<Like>>;
  findMany: MockedFunction<
    (args?: { where?: Partial<Like>; orderBy?: Record<string, unknown> }) => Promise<Like[]>
  >;
  count: MockedFunction<(args?: { where?: Partial<Like> }) => Promise<number>>;
  delete: MockedFunction<(args: { where: Partial<Like> }) => Promise<Like>>;
}

// Main Prisma Mock Interface
export interface MockedPrisma {
  user: MockedPrismaUser;
  tweet: MockedPrismaTweet;
  follow: MockedPrismaFollow;
  like: MockedPrismaLike;
  $connect: MockedFunction<() => Promise<void>>;
  $disconnect: MockedFunction<() => Promise<void>>;
  $transaction: MockedFunction<(queries: unknown[]) => Promise<unknown>>;
}

// Creates a fresh mock instance with all methods stubbed
export const createPrismaMock = (): MockedPrisma => ({
  user: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  tweet: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  follow: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  like: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
  $transaction: vi.fn(),
});

// Singleton pattern for consistent mocking across tests
export const mockPrisma = createPrismaMock();

// Mock Reset Utilities
export const PrismaMockUtils = {
  // Reset all mocks to initial state
  resetAll: (): void => {
    Object.values(mockPrisma).forEach((model) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model as Record<string, unknown>).forEach((method) => {
          if (vi.isMockFunction(method)) {
            method.mockReset();
          }
        });
      } else if (vi.isMockFunction(model)) {
        model.mockReset();
      }
    });
  },

  // Clear all mock call history
  clearAll: (): void => {
    Object.values(mockPrisma).forEach((model) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model as Record<string, unknown>).forEach((method) => {
          if (vi.isMockFunction(method)) {
            method.mockClear();
          }
        });
      } else if (vi.isMockFunction(model)) {
        model.mockClear();
      }
    });
  },

  // Setup default successful responses
  setupSuccessDefaults: (): void => {
    // Default successful responses for common operations
    mockPrisma.user.create.mockImplementation(() => Promise.resolve({ id: 1 } as User));
    mockPrisma.tweet.create.mockImplementation(() => Promise.resolve({ id: 1 } as Tweet));
    mockPrisma.follow.create.mockImplementation(() => Promise.resolve({ id: 1 } as Follow));
    mockPrisma.like.create.mockImplementation(() => Promise.resolve({ id: 1 } as Like));
  },
};

// Module Mock Setup
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));
