import type { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateDatabase,
} from '../../shared/setup/integration-db.config';

describe('🌱 Main Seeding Function Integration Tests', () => {
  let testDb: PrismaClient;
  let testDbName: string;

  beforeEach(async () => {
    vi.resetModules(); // This is crucial for re-importing the seed module
    const config = await setupTestDatabase();
    testDb = config.prismaClient;
    testDbName = config.databaseName;
    await truncateDatabase(testDb);
  }, 120000);

  afterEach(async () => {
    await teardownTestDatabase(testDbName);
  }, 60000);

  describe('Environment Routing Integration', () => {
    it('should correctly perform minimal data seeding in the test environment', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      vi.doMock('@/lib/prisma', () => ({ prisma: testDb }));

      const seedModule = await import('@/prisma/seeds/database.seed');
      await seedModule.main();

      const userCount = await testDb.user.count();
      expect(userCount).toBe(1);
    });

    it('should correctly perform comprehensive data seeding in the development environment', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.doMock('@/lib/prisma', () => ({ prisma: testDb }));

      const seedModule = await import('@/prisma/seeds/database.seed');
      await seedModule.main();

      const userCount = await testDb.user.count();
      expect(userCount).toBeGreaterThan(10);
    });

    it('should correctly perform lightweight data seeding in the staging environment', async () => {
      vi.stubEnv('NODE_ENV', 'staging');
      vi.doMock('@/lib/prisma', () => ({ prisma: testDb }));

      const seedModule = await import('@/prisma/seeds/database.seed');
      await seedModule.main();

      const userCount = await testDb.user.count();
      expect(userCount).toBeGreaterThanOrEqual(5);
    });

    it('should not perform seeding in the production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.doMock('@/lib/prisma', () => ({ prisma: testDb }));

      const seedModule = await import('@/prisma/seeds/database.seed');
      await seedModule.main();

      const userCount = await testDb.user.count();
      expect(userCount).toBe(0);
    });
  });
});
