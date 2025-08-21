import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks
vi.mock('./users.seed', () => ({
  createVerifiedUsers: vi.fn().mockResolvedValue([]),
  createRegularUsers: vi.fn().mockResolvedValue([]),
  createTestUser: vi.fn().mockResolvedValue({}),
}));
vi.mock('./tweets.seed', () => ({
  createTweets: vi.fn().mockResolvedValue([]),
  createReplyThreads: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./relationships.seed', () => ({
  createFollowRelationships: vi.fn().mockResolvedValue(undefined),
  createLikes: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./stats.seed', () => ({
  displayStats: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../utils/logger', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { main } from './database.seed';

describe('Database Main Seeding Script (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
  });

  it('should handle and log errors correctly when a sub-function fails', async () => {
    const testError = new Error('Failed to create users');
    const usersSeed = await import('./users.seed');
    vi.mocked(usersSeed.createVerifiedUsers).mockRejectedValue(testError);

    await expect(main()).rejects.toThrow(testError);

    const { log } = await import('../utils/logger');
    expect(log.error).toHaveBeenCalledWith(`Seeding failed: ${testError.message}`);
  });

  it('should handle and log non-Error rejections with a string', async () => {
    const testError = 'A simple string error';
    const usersSeed = await import('./users.seed');
    vi.mocked(usersSeed.createVerifiedUsers).mockRejectedValue(testError);

    await expect(main()).rejects.toBe(testError);

    const { log } = await import('../utils/logger');
    expect(log.error).toHaveBeenCalledWith(`Seeding failed: ${testError}`);
  });

  it('should handle and log object-like rejections', async () => {
    const testError = { code: 500, message: 'Unknown database error' };

    const usersSeed = await import('./users.seed');
    vi.mocked(usersSeed.createVerifiedUsers).mockRejectedValue(testError);

    await expect(main()).rejects.toBe(testError);

    const { log } = await import('../utils/logger');

    expect(log.error).toHaveBeenCalledWith(`Seeding failed: ${JSON.stringify(testError)}`);
  });
});
