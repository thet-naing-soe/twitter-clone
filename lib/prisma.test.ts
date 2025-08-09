import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from './prisma';

describe('Database Connection', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result).toEqual([{ connected: 1 }]);
  });

  it('should have users table with proper schema', async () => {
    // ✅ First ensure we can query the table (even if empty)
    const users = await prisma.user.findMany({ take: 1 });

    // ✅ Create a test user if none exists
    let testUser;
    if (users.length === 0) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
        },
      });
    } else {
      testUser = users[0];
    }

    // ✅ Now we're sure we have a user to test
    expect(testUser).toHaveProperty('id');
    expect(testUser).toHaveProperty('publicId');
    expect(testUser).toHaveProperty('email');
    expect(testUser).toHaveProperty('username');
    expect(testUser).toHaveProperty('displayName');
    expect(testUser).toHaveProperty('createdAt');
    expect(testUser).toHaveProperty('updatedAt');

    // ✅ Test data types
    expect(typeof testUser.id).toBe('number');
    expect(typeof testUser.publicId).toBe('string');
    expect(typeof testUser.email).toBe('string');
    expect(typeof testUser.username).toBe('string');
    expect(testUser.createdAt).toBeInstanceOf(Date);
    expect(testUser.updatedAt).toBeInstanceOf(Date);

    // ✅ Clean up test user if we created it
    if (users.length === 0) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  // ✅ Additional comprehensive tests
  it('should enforce unique constraints', async () => {
    const userData = {
      email: 'unique-test@example.com',
      username: 'uniquetestuser',
      displayName: 'Unique Test User',
    };

    // Create first user
    const user1 = await prisma.user.create({ data: userData });

    // Try to create user with same email
    await expect(
      prisma.user.create({
        data: { ...userData, username: 'different_username' },
      })
    ).rejects.toThrow();

    // Try to create user with same username
    await expect(
      prisma.user.create({
        data: { ...userData, email: 'different@example.com' },
      })
    ).rejects.toThrow();

    // Cleanup
    await prisma.user.delete({ where: { id: user1.id } });
  });

  it('should handle tweet relationships correctly', async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'tweet-test@example.com',
        username: 'tweettestuser',
        displayName: 'Tweet Test User',
      },
    });

    // Create test tweet
    const tweet = await prisma.tweet.create({
      data: {
        content: 'This is a test tweet',
        authorId: user.id,
      },
    });

    // Verify relationship
    const tweetWithAuthor = await prisma.tweet.findUnique({
      where: { id: tweet.id },
      include: { author: true },
    });

    expect(tweetWithAuthor).toBeTruthy();
    expect(tweetWithAuthor?.author.id).toBe(user.id);
    expect(tweetWithAuthor?.author.username).toBe('tweettestuser');

    // Cleanup
    await prisma.tweet.delete({ where: { id: tweet.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
