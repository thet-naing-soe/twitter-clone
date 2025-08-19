import type { Tweet, User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { faker } from '../utils/faker.utils';
import { log } from '../utils/logger';

import { SEEDING_CONFIG } from './constants';

export async function createFollowRelationships(allUsers: User[]): Promise<void> {
  log.info('🤝 Creating follow relationships...');

  const { FOLLOW_PROBABILITY } = SEEDING_CONFIG;

  const followPromises = allUsers.map(async (user) => {
    const followCount = faker.number.int(FOLLOW_PROBABILITY);
    const potentialFollows = allUsers.filter((u) => u.id !== user.id);
    const toFollow = faker.helpers.arrayElements(potentialFollows, followCount);

    const userFollowPromises = toFollow.map(async (followTarget) => {
      try {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: followTarget.id,
          },
        });
      } catch {
        log.warn(`⚠️ Duplicate follow skipped: ${user.username} -> ${followTarget.username}`);
      }
    });

    await Promise.all(userFollowPromises);
  });

  await Promise.all(followPromises);
}

export async function createLikes(allUsers: User[], allTweets: Tweet[]): Promise<void> {
  log.info('❤️ Creating likes...');

  const { LIKE_PROBABILITY } = SEEDING_CONFIG;

  const likePromises = allUsers.map(async (user) => {
    const likeCount = faker.number.int(LIKE_PROBABILITY);
    const tweetsToLike = faker.helpers.arrayElements(allTweets, likeCount);

    const userLikePromises = tweetsToLike.map(async (tweet) => {
      try {
        await createLike(user.id, tweet.id);
      } catch {
        log.warn(`⚠️ Duplicate like skipped: ${user.username} on tweet ID ${tweet.id}`);
      }
    });

    await Promise.all(userLikePromises);
  });

  await Promise.all(likePromises);
}

async function createLike(userId: number, tweetId: number): Promise<void> {
  await prisma.like.create({
    data: { userId, tweetId },
  });

  await prisma.tweet.update({
    where: { id: tweetId },
    data: { likesCount: { increment: 1 } },
  });
}
