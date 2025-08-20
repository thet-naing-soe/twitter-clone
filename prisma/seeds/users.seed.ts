import type { User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { faker } from '../utils/faker.utils';
import { log } from '../utils/logger';

import { SEEDING_CONFIG, VERIFIED_USERS_DATA } from './constants';

export async function createVerifiedUsers(): Promise<User[]> {
  const verifiedUsers: User[] = [];

  for (const userData of VERIFIED_USERS_DATA) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        avatar: faker.image.avatar(),
        verified: true,
      },
    });
    verifiedUsers.push(user);
  }

  return verifiedUsers;
}

export async function createRegularUsers(): Promise<User[]> {
  const regularUsers: User[] = [];
  const { REGULAR_USERS_COUNT, VERIFICATION_PROBABILITY, BIO_PROBABILITY } = SEEDING_CONFIG;

  log.info('👤 Creating regular users...');

  for (let i = 0; i < REGULAR_USERS_COUNT; i++) {
    const username = faker.internet.userName().toLowerCase();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        username: `${username}_${i}`,
        displayName: faker.person.fullName(),
        bio: faker.datatype.boolean({ probability: BIO_PROBABILITY })
          ? faker.lorem.sentence({ min: 3, max: 15 })
          : null,
        avatar: faker.image.avatar(),
        verified: faker.datatype.boolean({ probability: VERIFICATION_PROBABILITY }),
      },
    });
    regularUsers.push(user);

    if ((i + 1) % 10 === 0) {
      log.progress(i + 1, REGULAR_USERS_COUNT, 'regular users');
    }
  }

  return regularUsers;
}

export async function createTestUser(): Promise<User> {
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      bio: 'Test user for integration testing',
      verified: false,
    },
  });

  return testUser;
}

export async function createStagingUsers(): Promise<User[]> {
  const users: User[] = [];
  const { STAGING_USERS_COUNT } = SEEDING_CONFIG;

  for (let i = 0; i < STAGING_USERS_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: `staging${i}@example.com`,
        username: `staging_user_${i}`,
        displayName: `Staging User ${i}`,
        bio: 'Staging environment user',
        verified: i === 0,
      },
    });
    users.push(user);
  }

  return users;
}
