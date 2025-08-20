import { describe, expect, it } from 'vitest';

import { TestUtils } from '@/tests/shared/setup/db.config';

describe('Statistics Seeding Module', () => {
  const { mocks } = TestUtils;

  describe('displayStats()', () => {
    it('should collect and display all database counts', async () => {
      const expectedStats = {
        users: 50,
        tweets: 300,
        follows: 100,
        likes: 500,
      };

      mocks.prisma.user.count.mockResolvedValue(expectedStats.users);
      mocks.prisma.tweet.count.mockResolvedValue(expectedStats.tweets);
      mocks.prisma.follow.count.mockResolvedValue(expectedStats.follows);
      mocks.prisma.like.count.mockResolvedValue(expectedStats.likes);

      const { displayStats } = await import('@/prisma/seeds/stats.seed');
      await displayStats();

      expect(mocks.prisma.user.count).toHaveBeenCalledOnce();
      expect(mocks.prisma.tweet.count).toHaveBeenCalledOnce();
      expect(mocks.prisma.follow.count).toHaveBeenCalledOnce();
      expect(mocks.prisma.like.count).toHaveBeenCalledOnce();

      expect(mocks.console.log).toHaveBeenCalledWith('✅ Seeding completed!');
      expect(mocks.console.log).toHaveBeenCalledWith(
        `Final stats: ${JSON.stringify(expectedStats, null, 2)}`
      );
    });

    it('should handle zero counts correctly', async () => {
      const emptyStats = { users: 0, tweets: 0, follows: 0, likes: 0 };

      mocks.prisma.user.count.mockResolvedValue(0);
      mocks.prisma.tweet.count.mockResolvedValue(0);
      mocks.prisma.follow.count.mockResolvedValue(0);
      mocks.prisma.like.count.mockResolvedValue(0);

      const { displayStats } = await import('@/prisma/seeds/stats.seed');
      await displayStats();

      expect(mocks.console.log).toHaveBeenCalledWith(
        `Final stats: ${JSON.stringify(emptyStats, null, 2)}`
      );
    });
  });

  describe('getStats()', () => {
    it('should return statistics object without logging', async () => {
      const expectedStats = {
        users: 25,
        tweets: 150,
        follows: 75,
        likes: 200,
      };

      mocks.prisma.user.count.mockResolvedValue(expectedStats.users);
      mocks.prisma.tweet.count.mockResolvedValue(expectedStats.tweets);
      mocks.prisma.follow.count.mockResolvedValue(expectedStats.follows);
      mocks.prisma.like.count.mockResolvedValue(expectedStats.likes);

      const { getStats } = await import('@/prisma/seeds/stats.seed');
      const result = await getStats();

      expect(result).toEqual(expectedStats);
      // Should not log anything (unlike displayStats)
      expect(mocks.console.log).not.toHaveBeenCalledWith('✅ Seeding completed!');
    });

    it('should handle database errors during count operations', async () => {
      const dbError = new Error('Database connection failed');
      mocks.prisma.user.count.mockRejectedValue(dbError);

      const { getStats } = await import('@/prisma/seeds/stats.seed');
      await expect(getStats()).rejects.toThrow('Database connection failed');
    });
  });
});
