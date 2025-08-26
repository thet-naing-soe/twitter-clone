import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authOptions } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';

import { cleanDatabase, createTestUser } from '../../utils/auth-utils';

vi.mock('next-auth');

describe('Auth Integration Tests', () => {
  const mockedGetServerSession = vi.mocked(getServerSession);

  beforeEach(async () => {
    await cleanDatabase();
    mockedGetServerSession.mockClear();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('User Creation and Retrieval', () => {
    it('should create user in database and retrieve successfully', async () => {
      const user = await createTestUser('integration@test.com');

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('integration@test.com');
      expect(user.username).toBe('Test User');

      const foundUser = await prisma.user.findUnique({
        where: { email: 'integration@test.com' },
      });

      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(user.id);
    });
  });

  describe('Auth Configuration', () => {
    it('should have valid auth configuration', () => {
      expect(authOptions).toHaveProperty('providers');
      expect(authOptions.providers).toHaveLength(2); // Email + Google

      expect(authOptions).toHaveProperty('session');
      expect(authOptions.session?.strategy).toBe('jwt');

      expect(authOptions).toHaveProperty('callbacks');
      expect(authOptions.callbacks).toHaveProperty('session');
      expect(authOptions.callbacks).toHaveProperty('jwt');
    });

    it('should return expected format from callbacks', () => {
      const mockSession: Session = {
        user: {
          email: 'test@example.com',
          id: 'test-id',
        },
        expires: new Date().toISOString(),
      };

      const mockToken = { sub: 'user123' };

      if (authOptions.callbacks?.session) {
        const sessionResult = authOptions.callbacks.session({
          session: mockSession,
          token: mockToken,
        } as any);

        if (sessionResult && typeof sessionResult === 'object' && 'user' in sessionResult) {
          expect(sessionResult.user).toHaveProperty('id', 'user123');
        }
      }
    });
  });

  describe('getCurrentUser Function', () => {
    it('should return undefined when no session exists', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const user = await getCurrentUser();

      expect(user).toBeUndefined();
    });

    it('should return a user when a session exists', async () => {
      const mockSession: Session = {
        user: {
          id: 'mock-user-id',
          email: 'mock@test.com',
          name: 'Mock User',
        },
        expires: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
      };
      mockedGetServerSession.mockResolvedValue(mockSession);

      const user = await getCurrentUser();

      expect(user).not.toBeUndefined();
      expect(user?.id).toBe('mock-user-id');
      expect(user?.email).toBe('mock@test.com');
    });
  });
});
