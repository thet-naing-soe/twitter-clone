import { describe, expect, it } from 'vitest';

import { createMockUser } from '@/tests/factories/user.factory';
import { TestUtils } from '@/tests/setup/backend-unit.setup';

describe('Users Seeding Module', () => {
  const { mocks } = TestUtils;

  describe('createVerifiedUsers()', () => {
    it('should create all 3 verified users from VERIFIED_USERS_DATA', async () => {
      // Arrange
      const mockVerifiedUser = createMockUser({ verified: true });
      mocks.prisma.user.create.mockResolvedValue(mockVerifiedUser);

      // Act
      const { createVerifiedUsers } = await import('@/prisma/seeds/users.seed');
      const result = await createVerifiedUsers();

      // Assert
      expect(mocks.prisma.user.create).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);

      // Verify john_doe user creation
      const johnCall = mocks.prisma.user.create.mock.calls[0];
      expect(johnCall[0].data).toMatchObject({
        username: 'john_doe',
        email: 'john@example.com',
        displayName: 'John Doe',
        bio: 'Software Engineer at Tech Corp',
        verified: true,
      });
    });

    it('should assign faker avatar to all verified users', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);
      mocks.faker.image.avatar.mockReturnValue('https://example.com/avatar.jpg');

      const { createVerifiedUsers } = await import('@/prisma/seeds/users.seed');
      await createVerifiedUsers();

      const calls = mocks.prisma.user.create.mock.calls;
      calls.forEach((call) => {
        expect(call[0].data.avatar).toBe('https://example.com/avatar.jpg');
      });
    });
  });

  describe('createRegularUsers()', () => {
    it('should create exactly REGULAR_USERS_COUNT (47) users', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);
      mocks.faker.internet.userName.mockReturnValue('testuser');
      mocks.faker.internet.email.mockReturnValue('test@example.com');
      mocks.faker.person.fullName.mockReturnValue('Test User');
      mocks.faker.lorem.sentence.mockReturnValue('A test bio.');

      const { createRegularUsers } = await import('@/prisma/seeds/users.seed');
      const result = await createRegularUsers();

      expect(mocks.prisma.user.create).toHaveBeenCalledTimes(47);
      expect(result).toHaveLength(47);
    });

    it('should generate unique usernames with index suffix', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);
      mocks.faker.internet.userName.mockReturnValue('testuser');
      mocks.faker.internet.email.mockReturnValue('test@example.com');
      mocks.faker.person.fullName.mockReturnValue('Test User');

      const { createRegularUsers } = await import('@/prisma/seeds/users.seed');
      await createRegularUsers();

      // Check first few calls for username pattern
      const firstCall = mocks.prisma.user.create.mock.calls[0];
      const secondCall = mocks.prisma.user.create.mock.calls[1];

      expect(firstCall[0].data.username).toBe('testuser_0');
      expect(secondCall[0].data.username).toBe('testuser_1');
    });

    it('should apply BIO_PROBABILITY for bio generation', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);
      mocks.faker.internet.userName.mockReturnValue('testuser');
      mocks.faker.internet.email.mockReturnValue('test@example.com');
      mocks.faker.person.fullName.mockReturnValue('Test User');
      mocks.faker.lorem.sentence.mockReturnValue('Mock sentence for testing');

      // Mock probability checks
      mocks.faker.datatype.boolean
        .mockReturnValueOnce(true) // Has bio
        .mockReturnValueOnce(false); // No bio

      const { createRegularUsers } = await import('@/prisma/seeds/users.seed');
      await createRegularUsers();

      const calls = mocks.prisma.user.create.mock.calls;
      expect(calls[0][0].data.bio).toBe('Mock sentence for testing');
      expect(calls[1][0].data.bio).toBeNull();
    });

    it('should log progress every 10 users', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);
      mocks.faker.internet.userName.mockReturnValue('testuser');
      mocks.faker.internet.email.mockReturnValue('test@example.com');
      mocks.faker.person.fullName.mockReturnValue('Test User');
      mocks.faker.lorem.sentence.mockReturnValue('A test bio.');

      const { createRegularUsers } = await import('@/prisma/seeds/users.seed');
      await createRegularUsers();

      expect(mocks.console.log).toHaveBeenCalledWith('👤 Creating regular users...');
      expect(mocks.console.log).toHaveBeenCalledWith('📊 Created 10/47 regular users');
      expect(mocks.console.log).toHaveBeenCalledWith('📊 Created 20/47 regular users');
    });
  });

  describe('createTestUser()', () => {
    it('should create single test user with fixed data', async () => {
      const expectedUser = createMockUser({
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test user for integration testing',
        verified: false,
      });
      mocks.prisma.user.create.mockResolvedValue(expectedUser);

      const { createTestUser } = await import('@/prisma/seeds/users.seed');
      const result = await createTestUser();

      expect(result).toEqual(expectedUser);
      expect(mocks.prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          bio: 'Test user for integration testing',
          verified: false,
        },
      });
    });
  });

  describe('createStagingUsers()', () => {
    it('should create STAGING_USERS_COUNT (5) users', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);

      const { createStagingUsers } = await import('@/prisma/seeds/users.seed');
      const result = await createStagingUsers();

      expect(mocks.prisma.user.create).toHaveBeenCalledTimes(5);
      expect(result).toHaveLength(5);
    });

    it('should verify only first staging user (index 0)', async () => {
      const mockUser = createMockUser();
      mocks.prisma.user.create.mockResolvedValue(mockUser);

      const { createStagingUsers } = await import('@/prisma/seeds/users.seed');
      await createStagingUsers();

      const calls = mocks.prisma.user.create.mock.calls;
      expect(calls[0][0].data.verified).toBe(true); // First user verified
      expect(calls[1][0].data.verified).toBe(false); // Others not verified
    });
  });
});
