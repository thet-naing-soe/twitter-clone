import { faker } from '@faker-js/faker';
import type { Tweet, User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data first (optional, for development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.like.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.user.deleteMany();
  }

  console.log('👥 Creating 50 users...');

  // Create 50 users with unique usernames
  const users: User[] = await prisma.$transaction(
    Array.from({ length: 50 }).map((_, index) => {
      // Generate unique username
      const baseUsername = faker.internet.userName().toLowerCase();
      const uniqueUsername = `${baseUsername}_${index}`; // Ensure uniqueness

      return prisma.user.create({
        data: {
          email: `${faker.string.nanoid()}@example.com`.toLowerCase(),
          username: uniqueUsername,
          displayName: faker.person.fullName(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          verified: faker.datatype.boolean({ probability: 0.1 }), // 10% verified
        },
      });
    })
  );

  console.log(`✅ Created ${users.length} users`);

  console.log('🐦 Creating 300 tweets...');

  // Create 300 tweets
  const tweets: Tweet[] = await prisma.$transaction(
    Array.from({ length: 300 }).map(() => {
      const author = faker.helpers.arrayElement(users);
      const content = faker.lorem.sentence({ min: 3, max: 20 });

      return prisma.tweet.create({
        data: {
          authorId: author.id,
          content: content.length > 280 ? content.slice(0, 277) + '...' : content,
          createdAt: faker.date.recent({ days: 30 }),
        },
      });
    })
  );

  console.log(`✅ Created ${tweets.length} tweets`);

  // Create some follow relationships
  console.log('🤝 Creating follow relationships...');

  const followRelationships = [];
  for (let i = 0; i < 100; i++) {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);

    // Prevent self-follow
    if (follower.id !== following.id) {
      followRelationships.push({
        followerId: follower.id,
        followingId: following.id,
      });
    }
  }

  // Use createMany for bulk insert (more efficient)
  try {
    const follows = await prisma.follow.createMany({
      data: followRelationships,
      skipDuplicates: true, // Skip if duplicate relationship exists
    });
    console.log(`✅ Created ${follows.count} follow relationships`);
  } catch (error: unknown) {
    console.error('⚠️  Some follow relationships were duplicates, continuing...', error);
  }

  // Create some likes
  console.log('❤️ Creating likes...');

  const likeRelationships = [];
  for (let i = 0; i < 500; i++) {
    const user = faker.helpers.arrayElement(users);
    const tweet = faker.helpers.arrayElement(tweets);

    likeRelationships.push({
      userId: user.id,
      tweetId: tweet.id,
    });
  }

  try {
    const likes = await prisma.like.createMany({
      data: likeRelationships,
      skipDuplicates: true,
    });
    console.log(`✅ Created ${likes.count} likes`);
  } catch (error: unknown) {
    console.error('⚠️  Some likes were duplicates, continuing...', error);
  }

  // Final stats
  const stats = {
    users: await prisma.user.count(),
    tweets: await prisma.tweet.count(),
    follows: await prisma.follow.count(),
    likes: await prisma.like.count(),
  };

  console.log('📊 Final Statistics:');
  console.log(`   Users: ${stats.users}`);
  console.log(`   Tweets: ${stats.tweets}`);
  console.log(`   Follows: ${stats.follows}`);
  console.log(`   Likes: ${stats.likes}`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('❌ Seeding failed:', err.message);
      console.error(err.stack);
    } else {
      console.error('❌ Seeding failed with a non-Error value:', err);
    }
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
