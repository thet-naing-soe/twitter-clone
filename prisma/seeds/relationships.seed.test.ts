import type { Follow, Like } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { createMockTweets } from '@/tests/shared/factories/tweet.factory';
import { createMockUsers } from '@/tests/shared/factories/user.factory';
import { TestUtils } from '@/tests/shared/setup/db.config';

describe('Relationships Seeding Module', () => {
  const { mocks } = TestUtils;

  describe('createFollowRelationships()', () => {
    it('should create follow relationships based on FOLLOW_PROBABILITY', async () => {
      const mockUsers = createMockUsers(3);
      mocks.faker.number.int.mockReturnValue(2); // Each user follows 2 others
      mocks.faker.helpers.arrayElements.mockImplementation((arr, count) => arr.slice(0, count));
      mocks.prisma.follow.create.mockResolvedValue({} as Follow);

      const { createFollowRelationships } = await import('@/prisma/seeds/relationships.seed');
      await createFollowRelationships(mockUsers);

      expect(mocks.console.log).toHaveBeenCalledWith('🤝 Creating follow relationships...');
      // 3 users × 2 follows each = 6 total follow relationships
      expect(mocks.prisma.follow.create).toHaveBeenCalledTimes(6);
    });

    it('should filter out self from potential follows', async () => {
      const mockUsers = createMockUsers(3);
      mocks.faker.number.int.mockReturnValue(1);

      // Capture the filtered array passed to arrayElements
      let filteredUsers: any[] = [];
      mocks.faker.helpers.arrayElements.mockImplementation((arr, count) => {
        filteredUsers = arr;
        return arr.slice(0, count);
      });
      mocks.prisma.follow.create.mockResolvedValue({} as Follow);

      const { createFollowRelationships } = await import('@/prisma/seeds/relationships.seed');
      await createFollowRelationships(mockUsers);

      // Each user should be filtered out of their own potential follows
      expect(filteredUsers.length).toBe(2); // 3 total - 1 self = 2 potential follows
    });

    it('should handle duplicate follow errors gracefully', async () => {
      const mockUsers = createMockUsers(2);
      mocks.faker.number.int.mockReturnValue(1);
      mocks.faker.helpers.arrayElements.mockReturnValue([mockUsers[1]]);
      mocks.prisma.follow.create.mockRejectedValue(new Error('Duplicate follow'));

      const { createFollowRelationships } = await import('@/prisma/seeds/relationships.seed');

      // Should not throw error
      await expect(createFollowRelationships(mockUsers)).resolves.not.toThrow();

      // Should log warning about duplicate
      expect(mocks.console.log).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Duplicate follow skipped')
      );
    });
  });

  describe('createLikes()', () => {
    it('should create likes based on LIKE_PROBABILITY range', async () => {
      const mockUsers = createMockUsers(2);
      const mockTweets = createMockTweets(5);

      mocks.faker.number.int.mockReturnValue(3); // Each user likes 3 tweets
      mocks.faker.helpers.arrayElements.mockImplementation((arr, count) => arr.slice(0, count));
      mocks.prisma.like.create.mockResolvedValue({} as Like);
      mocks.prisma.tweet.update.mockResolvedValue(mockTweets[0]);

      const { createLikes } = await import('@/prisma/seeds/relationships.seed');
      await createLikes(mockUsers, mockTweets);

      expect(mocks.console.log).toHaveBeenCalledWith('❤️ Creating likes...');
      // 2 users × 3 likes each = 6 total likes
      expect(mocks.prisma.like.create).toHaveBeenCalledTimes(6);
    });

    it('should update tweet likesCount for each like', async () => {
      const mockUsers = createMockUsers(1);
      const mockTweets = createMockTweets(1);

      mocks.faker.number.int.mockReturnValue(1);
      mocks.faker.helpers.arrayElements.mockReturnValue([mockTweets[0]]);
      mocks.prisma.like.create.mockResolvedValue({} as Like);
      mocks.prisma.tweet.update.mockResolvedValue(mockTweets[0]);

      const { createLikes } = await import('@/prisma/seeds/relationships.seed');
      await createLikes(mockUsers, mockTweets);

      expect(mocks.prisma.tweet.update).toHaveBeenCalledWith({
        where: { id: mockTweets[0].id },
        data: { likesCount: { increment: 1 } },
      });
    });

    it('should handle duplicate like errors gracefully', async () => {
      const mockUsers = createMockUsers(1);
      const mockTweets = createMockTweets(1);

      mocks.faker.number.int.mockReturnValue(1);
      mocks.faker.helpers.arrayElements.mockReturnValue([mockTweets[0]]);
      mocks.prisma.like.create.mockRejectedValue(new Error('Duplicate like'));

      const { createLikes } = await import('@/prisma/seeds/relationships.seed');

      // Should handle gracefully
      await expect(createLikes(mockUsers, mockTweets)).resolves.not.toThrow();

      // Should log warning
      expect(mocks.console.log).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Duplicate like skipped')
      );
    });

    it('should create proper like relationship data structure', async () => {
      const mockUsers = createMockUsers(1);
      const mockTweets = createMockTweets(1);

      mocks.faker.number.int.mockReturnValue(1);
      mocks.faker.helpers.arrayElements.mockReturnValue([mockTweets[0]]);
      mocks.prisma.like.create.mockResolvedValue({} as Like);
      mocks.prisma.tweet.update.mockResolvedValue(mockTweets[0]);

      const { createLikes } = await import('@/prisma/seeds/relationships.seed');
      await createLikes(mockUsers, mockTweets);

      const likeCall = mocks.prisma.like.create.mock.calls[0];
      expect(likeCall[0].data).toEqual({
        userId: mockUsers[0].id,
        tweetId: mockTweets[0].id,
      });
    });
  });
});
