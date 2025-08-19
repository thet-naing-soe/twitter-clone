import type { Tweet } from '@prisma/client';

// Base Tweet Template
const BASE_TWEET_TEMPLATE: Readonly<Tweet> = Object.freeze({
  id: 1,
  publicId: 'tweet-1',
  content: 'Test tweet content',
  authorId: 1,
  parentId: null,
  media: null,
  likesCount: 0,
  repliesCount: 0,
  retweetsCount: 0,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  deletedAt: null,
} as const);

// Primary Tweet Factory
export const createMockTweet = (overrides: Partial<Tweet> = {}): Tweet => ({
  ...BASE_TWEET_TEMPLATE,
  ...overrides,
});

// Batch Tweet Factory with Author Distribution
export const createMockTweets = (count: number, authorCount = 3): Tweet[] =>
  Array.from({ length: count }, (_, index) =>
    createMockTweet({
      id: index + 1,
      publicId: `tweet-${index + 1}`,
      content: `Tweet content ${index + 1}`,
      authorId: (index % authorCount) + 1, // Even distribution among authors
    })
  );

// Reply Tweet Factory
export const createMockReply = (parentTweetId: number, authorId: number): Tweet =>
  createMockTweet({
    parentId: parentTweetId,
    authorId,
    content: 'Reply content',
  });

// Tweet Content Generators
export const TweetContentGenerators = [
  () => 'Just finished an amazing coding session! 💪',
  () => 'Thoughts on the latest tech trends?',
  () => "Working on something exciting. Can't wait to share! #coding #tech",
  () => 'Beautiful day for some development work ☀️',
  () => 'Learning never stops in tech world 📚',
] as const;

// Tweet Variants
export const TweetVariants = {
  /** Basic tweet */
  basic: () => createMockTweet(),

  /** Tweet with media */
  withMedia: () =>
    createMockTweet({
      media: ['https://example.com/image.jpg'],
    }),

  /** Tweet with engagement */
  popular: () =>
    createMockTweet({
      likesCount: 50,
      repliesCount: 10,
      retweetsCount: 5,
    }),

  /** Reply tweet */
  reply: (parentId: number, authorId: number) =>
    createMockTweet({
      parentId,
      authorId,
    }),

  /** Thread starter */
  threadStarter: () =>
    createMockTweet({
      repliesCount: 3,
    }),
} as const;
