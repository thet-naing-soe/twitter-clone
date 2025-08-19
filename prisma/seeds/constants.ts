import type { VerifiedUserData } from './types';

export const VERIFIED_USERS_DATA: VerifiedUserData[] = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    bio: 'Software Engineer at Tech Corp',
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    bio: 'Product Manager & Tech Enthusiast',
  },
  {
    username: 'tech_guru',
    email: 'guru@example.com',
    displayName: 'Tech Guru',
    bio: 'Sharing daily tech insights',
  },
];

export const SEEDING_CONFIG = {
  REGULAR_USERS_COUNT: 47,
  TWEETS_COUNT: 300,
  STAGING_USERS_COUNT: 5,
  STAGING_TWEETS_COUNT: 20,
  BATCH_SIZE: 50,
  FOLLOW_PROBABILITY: { min: 3, max: 15 },
  MEDIA_PROBABILITY: 0.15,
  REPLY_PROBABILITY: 0.3,
  LIKE_PROBABILITY: { min: 10, max: 50 },
  VERIFICATION_PROBABILITY: 0.05,
  BIO_PROBABILITY: 0.7,
} as const;
