import type { Prisma, Tweet, User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { faker, tweetContentGenerators } from '../utils/faker.utils';
import { log } from '../utils/logger';

import { SEEDING_CONFIG } from './constants';

export async function createTweets(allUsers: User[]): Promise<Tweet[]> {
  log.info('🐦 Creating tweets...');

  const allTweets: Tweet[] = [];
  const { TWEETS_COUNT, BATCH_SIZE, MEDIA_PROBABILITY } = SEEDING_CONFIG;

  for (let i = 0; i < TWEETS_COUNT; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, TWEETS_COUNT);
    const batchPromises = [];

    for (let j = i; j < batchEnd; j++) {
      const author = faker.helpers.arrayElement(allUsers);
      const contentGenerator = faker.helpers.arrayElement(tweetContentGenerators)();
      const hasMedia = faker.datatype.boolean({ probability: MEDIA_PROBABILITY });

      const tweetData: Prisma.TweetCreateInput = {
        content: contentGenerator,
        author: { connect: { id: author.id } },
        ...(hasMedia && {
          media: [faker.image.url({ width: 600, height: 400 })],
        }),
      };

      batchPromises.push(prisma.tweet.create({ data: tweetData }));
    }

    const batchResults = await Promise.all(batchPromises);
    allTweets.push(...batchResults);

    log.progress(Math.min(i + BATCH_SIZE, TWEETS_COUNT), TWEETS_COUNT, 'tweets');
  }

  return allTweets;
}

export async function createReplyThreads(allUsers: User[], allTweets: Tweet[]): Promise<void> {
  log.info('💬 Creating reply threads...');

  const { REPLY_PROBABILITY } = SEEDING_CONFIG;
  const tweetsToReply = faker.helpers.arrayElements(
    allTweets,
    Math.floor(allTweets.length * REPLY_PROBABILITY)
  );

  const replyPromises = tweetsToReply.map(async (parentTweet) => {
    const replyCount = faker.number.int({ min: 1, max: 5 });
    const replies: Promise<void>[] = [];

    for (let i = 0; i < replyCount; i++) {
      const replier = faker.helpers.arrayElement(allUsers);

      const replyPromise = createReply(replier.id, parentTweet.id);
      replies.push(replyPromise);
    }

    await Promise.all(replies);
  });

  await Promise.all(replyPromises);
}

async function createReply(replierId: number, parentId: number): Promise<void> {
  await prisma.tweet.create({
    data: {
      content: faker.lorem.sentence({ min: 3, max: 20 }),
      authorId: replierId,
      parentId,
    },
  });

  await prisma.tweet.update({
    where: { id: parentId },
    data: { repliesCount: { increment: 1 } },
  });
}

export async function createStagingTweets(users: User[]): Promise<void> {
  const { STAGING_TWEETS_COUNT } = SEEDING_CONFIG;

  const tweetPromises = Array.from({ length: STAGING_TWEETS_COUNT }, (_, i) => {
    const author = faker.helpers.arrayElement(users);
    return prisma.tweet.create({
      data: {
        content: `Staging tweet ${i + 1}: ${faker.lorem.sentence()}`,
        authorId: author.id,
      },
    });
  });

  await Promise.all(tweetPromises);
}
