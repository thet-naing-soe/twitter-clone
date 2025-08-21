import type { User } from '@prisma/client';

// Base User Template (Immutable Reference Data)
const BASE_USER_TEMPLATE: Readonly<User> = Object.freeze({
  id: 1,
  publicId: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  bio: 'Test user bio',
  avatar: null,
  verified: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'), // Fixed date for deterministic tests
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  deletedAt: null,
} as const);

// Creates a single mock user with optional overrides
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...BASE_USER_TEMPLATE,
  ...overrides,
});

// Creates multiple users with sequential IDs and unique data
export const createMockUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: index + 1,
      publicId: `user-${index + 1}`,
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      displayName: `Test User ${index + 1}`,
    })
  );

// Creates predefined verified users for consistent testing
export const createMockVerifiedUsers = (): User[] => [
  createMockUser({
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    bio: 'Software Engineer at Tech Corp',
    verified: true,
  }),
  createMockUser({
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    bio: 'Product Manager & Tech Enthusiast',
    verified: true,
  }),
  createMockUser({
    id: 3,
    username: 'tech_guru',
    email: 'guru@example.com',
    displayName: 'Tech Guru',
    bio: 'Sharing daily tech insights',
    verified: true,
  }),
];

// Random User Variants
export const UserVariants = {
  /** Basic unverified user */
  basic: () => createMockUser(),

  /** Verified user */
  verified: () => createMockUser({ verified: true }),

  /** User without bio */
  noBio: () => createMockUser({ bio: null }),

  /** User with avatar */
  withAvatar: () => createMockUser({ avatar: 'https://example.com/avatar.jpg' }),

  /** Deleted user */
  deleted: () => createMockUser({ deletedAt: new Date() }),
} as const;
