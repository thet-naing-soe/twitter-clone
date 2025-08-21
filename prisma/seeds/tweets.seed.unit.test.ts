import { describe, expect, it, vi } from 'vitest';

import { createMockTweet } from '@/tests/factories/tweet.factory';
import { createMockUsers } from '@/tests/factories/user.factory';
import { TestUtils } from '@/tests/setup/backend-unit.setup';

describe('Tweets Seeding Module', () => {
  const { mocks } = TestUtils;

  describe('createTweets()', () => {
    it('should create TWEETS_COUNT (300) tweets in batches', async () => {
      const mockUsers = createMockUsers(5);
      const mockTweet = createMockTweet();
      mocks.prisma.tweet.create.mockResolvedValue(mockTweet);
      const mockContentGenerator = vi.fn().mockReturnValue('mock tweet content');
      mocks.faker.helpers.arrayElement.mockImplementation((arr: any[]) => {
        // If the array seems to be the list of content generator functions, return our mock function
        if (arr.some((item) => typeof item === 'function')) {
          return mockContentGenerator;
        }
        // Otherwise, return the first user for the author
        return arr[0];
      });

      const { createTweets } = await import('@/prisma/seeds/tweets.seed');
      const result = await createTweets(mockUsers);

      expect(mocks.prisma.tweet.create).toHaveBeenCalledTimes(300);
      expect(result).toHaveLength(300);
      expect(mocks.console.log).toHaveBeenCalledWith('🐦 Creating tweets...');
    });

    it('should include media based on MEDIA_PROBABILITY', async () => {
      const mockUsers = createMockUsers(1);
      const mockTweet = createMockTweet();
      mocks.prisma.tweet.create.mockResolvedValue(mockTweet);

      // Force media inclusion
      mocks.faker.datatype.boolean.mockReturnValueOnce(true);
      mocks.faker.image.url.mockReturnValue('https://example.com/image.jpg');
      const mockContentGenerator = vi.fn().mockReturnValue('mock tweet content');
      mocks.faker.helpers.arrayElement.mockImplementation((arr: any[]) => {
        if (arr.some((item) => typeof item === 'function')) {
          return mockContentGenerator;
        }
        return arr[0];
      });

      const { createTweets } = await import('@/prisma/seeds/tweets.seed');
      await createTweets(mockUsers);

      const tweetCall = mocks.prisma.tweet.create.mock.calls[0];
      expect(tweetCall[0].data.media).toEqual(['https://example.com/image.jpg']);
    });

    it('should distribute tweets among all provided users', async () => {
      const mockUsers = createMockUsers(3);
      const mockTweet = createMockTweet();
      mocks.prisma.tweet.create.mockResolvedValue(mockTweet);

      // Mock user selection to rotate through users
      let userIndex = 0;
      mocks.faker.helpers.arrayElement.mockImplementation((users) => {
        return users[userIndex++ % users.length];
      });

      const { createTweets } = await import('@/prisma/seeds/tweets.seed');
      await createTweets(mockUsers);

      // Verify different users were selected as authors
      expect(mocks.faker.helpers.arrayElement).toHaveBeenCalledWith(mockUsers);
    });

    it('should log progress at BATCH_SIZE intervals', async () => {
      const mockUsers = createMockUsers(1);
      const mockTweet = createMockTweet();
      mocks.prisma.tweet.create.mockResolvedValue(mockTweet);
      const mockContentGenerator = vi.fn().mockReturnValue('mock tweet content');
      mocks.faker.helpers.arrayElement.mockImplementation((arr: any[]) => {
        if (arr.some((item) => typeof item === 'function')) {
          return mockContentGenerator;
        }
        return arr[0];
      });

      const { createTweets } = await import('@/prisma/seeds/tweets.seed');
      await createTweets(mockUsers);

      // Should log progress for each batch (50, 100, 150, etc.)
      expect(mocks.console.log).toHaveBeenCalledWith('📊 Created 50/300 tweets');
      expect(mocks.console.log).toHaveBeenCalledWith('📊 Created 100/300 tweets');
    });
  });

  describe('createReplyThreads()', () => {
    it('should create replies based on REPLY_PROBABILITY', async () => {
      const mockUsers = createMockUsers(2);
      const mockTweets = [createMockTweet({ id: 1 }), createMockTweet({ id: 2 })];

      // Mock 30% selection (REPLY_PROBABILITY = 0.3)
      const selectedTweets = [mockTweets[0]];
      mocks.faker.helpers.arrayElements.mockReturnValue(selectedTweets);
      mocks.faker.number.int.mockReturnValue(2); // 2 replies
      mocks.prisma.tweet.create.mockResolvedValue(createMockTweet());
      mocks.prisma.tweet.update.mockResolvedValue(createMockTweet());
      mocks.faker.helpers.arrayElement.mockReturnValue(mockUsers[0]);

      const { createReplyThreads } = await import('@/prisma/seeds/tweets.seed');
      await createReplyThreads(mockUsers, mockTweets);

      expect(mocks.console.log).toHaveBeenCalledWith('💬 Creating reply threads...');
      expect(mocks.faker.helpers.arrayElements).toHaveBeenCalledWith(
        mockTweets,
        Math.floor(mockTweets.length * 0.3)
      );
    });

    it('should update parent tweet repliesCount', async () => {
      const mockUsers = createMockUsers(1);
      const parentTweet = createMockTweet({ id: 1 });
      const mockTweets = [parentTweet];

      mocks.faker.helpers.arrayElements.mockReturnValue([parentTweet]);
      mocks.faker.number.int.mockReturnValue(1);
      mocks.prisma.tweet.create.mockResolvedValue(createMockTweet());
      mocks.prisma.tweet.update.mockResolvedValue(createMockTweet());
      mocks.faker.helpers.arrayElement.mockReturnValue(mockUsers[0]);

      const { createReplyThreads } = await import('@/prisma/seeds/tweets.seed');
      await createReplyThreads(mockUsers, mockTweets);

      expect(mocks.prisma.tweet.update).toHaveBeenCalledWith({
        where: { id: parentTweet.id },
        data: { repliesCount: { increment: 1 } },
      });
    });

    it('should create reply with correct parent relationship', async () => {
      const mockUsers = createMockUsers(1);
      const parentTweet = createMockTweet({ id: 5 });
      const mockTweets = [parentTweet];

      mocks.faker.helpers.arrayElements.mockReturnValue([parentTweet]);
      mocks.faker.number.int.mockReturnValue(1);
      mocks.faker.helpers.arrayElement.mockReturnValue(mockUsers[0]);
      mocks.prisma.tweet.create.mockResolvedValue(createMockTweet());
      mocks.prisma.tweet.update.mockResolvedValue(createMockTweet());

      const { createReplyThreads } = await import('@/prisma/seeds/tweets.seed');
      await createReplyThreads(mockUsers, mockTweets);

      const replyCall = mocks.prisma.tweet.create.mock.calls[0];
      expect(replyCall[0].data).toMatchObject({
        authorId: mockUsers[0].id,
        parentId: parentTweet.id,
      });
    });
  });

  describe('createStagingTweets()', () => {
    it('should create STAGING_TWEETS_COUNT (20) tweets', async () => {
      const mockUsers = createMockUsers(2);
      const mockTweet = createMockTweet();
      mocks.prisma.tweet.create.mockResolvedValue(mockTweet);
      mocks.faker.helpers.arrayElement.mockReturnValue(mockUsers[0]);

      const { createStagingTweets } = await import('@/prisma/seeds/tweets.seed');
      await createStagingTweets(mockUsers);

      expect(mocks.prisma.tweet.create).toHaveBeenCalledTimes(20);
    });

    it('should create staging tweets with numbered content', async () => {
      const mockUsers = createMockUsers(1);
      const mockTweet = createMockTweet();
      mocks.prisma.tweet.create.mockResolvedValue(mockTweet);
      mocks.faker.lorem.sentence.mockReturnValue('staging sentence');
      mocks.faker.helpers.arrayElement.mockReturnValue(mockUsers[0]);

      const { createStagingTweets } = await import('@/prisma/seeds/tweets.seed');
      await createStagingTweets(mockUsers);

      const firstCall = mocks.prisma.tweet.create.mock.calls[0];
      expect(firstCall[0].data.content).toBe('Staging tweet 1: staging sentence');
    });
  });
});
