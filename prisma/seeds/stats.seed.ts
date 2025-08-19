import { prisma } from '@/lib/prisma';

import { log } from '../utils/logger';

import type { SeedingStats } from './types';

export async function displayStats(): Promise<void> {
  const stats: SeedingStats = {
    users: await prisma.user.count(),
    tweets: await prisma.tweet.count(),
    follows: await prisma.follow.count(),
    likes: await prisma.like.count(),
  };

  log.success('Seeding completed!');
  log.info(`Final stats: ${JSON.stringify(stats, null, 2)}`);
}

export async function getStats(): Promise<SeedingStats> {
  return {
    users: await prisma.user.count(),
    tweets: await prisma.tweet.count(),
    follows: await prisma.follow.count(),
    likes: await prisma.like.count(),
  };
}
