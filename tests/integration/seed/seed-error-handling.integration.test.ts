import { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateDatabase,
} from '@/tests/integration/database/integration-db.config';

describe('⚠️ Error Handling Integration Tests', () => {
  let testDb: PrismaClient;
  let testDbName: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const config = await setupTestDatabase();
    testDb = config.prismaClient;
    testDbName = config.databaseName;
    await truncateDatabase(testDb);
  }, 120000);

  afterEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    await teardownTestDatabase(testDbName);
  }, 60000);

  describe('Database Constraint Violations', () => {
    it('should gracefully handle duplicate emails', async () => {
      await testDb.user.create({
        data: { email: 'duplicate@example.com', username: 'user1', displayName: 'User One' },
      });
      await expect(
        testDb.user.create({
          data: { email: 'duplicate@example.com', username: 'user2', displayName: 'User Two' },
        })
      ).rejects.toThrow(/unique constraint/i);
      const userCount = await testDb.user.count();
      expect(userCount).toBe(1);
      console.log('✅ Duplicate email constraint verified');
    }, 60000);

    it('should handle invalid foreign key relationships', async () => {
      await expect(
        testDb.tweet.create({ data: { content: 'Test tweet', authorId: 999 } })
      ).rejects.toThrow(/foreign key constraint/i);
      const tweetCount = await testDb.tweet.count();
      expect(tweetCount).toBe(0);
      console.log('✅ Foreign key constraint verified');
    }, 60000);
  });

  describe('Connection Recovery', () => {
    it('should handle a database connection error correctly', async () => {
      const badDbUrl = `postgresql://user:password@localhost:9999/nonexistentdb?schema=public`;

      const badPrismaClient = new PrismaClient({
        datasources: {
          db: { url: badDbUrl },
        },
      });

      await expect(badPrismaClient.user.count()).rejects.toThrow();
      await badPrismaClient.$disconnect();
      console.log('✅ Connection error handling verified');
    }, 60000);
  });

  describe('Transaction Rollback Scenarios', () => {
    it('should maintain data consistency when an error occurs in batch operations', async () => {
      const user = await testDb.user.create({
        data: { email: 'test@example.com', username: 'testuser', displayName: 'Test User' },
      });
      await expect(
        testDb.$transaction([
          testDb.tweet.create({ data: { content: 'Valid tweet 1', authorId: user.id } }),
          testDb.tweet.create({ data: { content: 'Invalid tweet', authorId: 999 } }), // This will fail
        ])
      ).rejects.toThrow(/foreign key constraint/i);
      const tweetCount = await testDb.tweet.count();
      expect(tweetCount).toBe(0); // The transaction should be rolled back
      console.log('✅ Transaction rollback verified');
    }, 60000);
  });
});
