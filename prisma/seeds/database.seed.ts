import { prisma } from '@/lib/prisma';

import { log } from '../utils/logger';

import { createFollowRelationships, createLikes } from './relationships.seed';
import { displayStats } from './stats.seed';
import { createReplyThreads, createStagingTweets, createTweets } from './tweets.seed';
import type { Environment } from './types';
import {
  createRegularUsers,
  createStagingUsers,
  createTestUser,
  createVerifiedUsers,
} from './users.seed';

// Helper function to format errors properly
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return JSON.stringify(error);
}

export async function main(): Promise<void> {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  log.info(`Starting database seeding for: ${env}`);

  try {
    switch (env) {
      case 'test':
        await seedMinimalTestData();
        break;
      case 'development':
        await seedDevelopmentData();
        break;
      case 'staging':
        await seedStagingData();
        break;
      default:
        log.info('No seeding for production environment');
    }
  } catch (error: unknown) {
    log.error(`Seeding failed: ${formatError(error)}`);
    throw error;
  }
}

export async function seedMinimalTestData(): Promise<void> {
  log.info('Seeding minimal test data...');

  const testUser = await createTestUser();
  log.success(`Created test user: ${testUser.username} (ID: ${testUser.id})`);
}

export async function seedDevelopmentData(): Promise<void> {
  log.info('Seeding comprehensive development data...');

  const verifiedUsers = await createVerifiedUsers();
  log.success(`Created ${verifiedUsers.length} verified users`);

  const regularUsers = await createRegularUsers();
  log.success(`Created ${regularUsers.length} regular users`);

  const allUsers = [...verifiedUsers, ...regularUsers];

  await createFollowRelationships(allUsers);
  log.success('Created follow relationships');

  const allTweets = await createTweets(allUsers);
  log.success(`Created ${allTweets.length} tweets`);

  await createReplyThreads(allUsers, allTweets);
  log.success('Created reply threads');

  await createLikes(allUsers, allTweets);
  log.success('Created likes');

  await displayStats();
}

export async function seedStagingData(): Promise<void> {
  log.info('Seeding staging data...');

  const users = await createStagingUsers();
  log.success(`Created ${users.length} staging users`);

  await createStagingTweets(users);
  log.success('Created staging tweets');

  await displayStats();
}

// Execute if this file is run directly
/* v8 ignore start */
main()
  .then(async () => {
    await prisma.$disconnect();
    log.info('Database connection closed');
  })
  .catch(async (error: unknown) => {
    log.error(`Seeding failed: ${formatError(error)}`);
    await prisma.$disconnect();
    process.exit(1);
  });
/* v8 ignore stop */
