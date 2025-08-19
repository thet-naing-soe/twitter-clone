import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

import { testEnv } from './test-env.config';

let testPrisma: PrismaClient | null = null;

interface TestDatabaseConfig {
  databaseUrl: string;
  prismaClient: PrismaClient;
  databaseName: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function setupTestDatabase(): Promise<TestDatabaseConfig> {
  const testDbName = `test_db_${randomUUID().replace(/-/g, '').substring(0, 10)}`;

  const databaseUrl = `postgresql://${testEnv.db.user}:${testEnv.db.password}@${testEnv.db.host}:${testEnv.db.port}/${testDbName}?schema=public`;

  const commandEnv = {
    ...process.env,
    PGUSER: testEnv.db.user,
    PGPASSWORD: testEnv.db.password,
    PGHOST: testEnv.db.host,
    PGPORT: String(testEnv.db.port),
    DATABASE_URL: databaseUrl, // For Prisma CLI
  };

  try {
    console.log(`🔄 Creating test database: ${testDbName}`);

    execSync(`createdb ${testDbName}`, { env: commandEnv, stdio: 'pipe', timeout: 90000 });

    console.log(`📊 Pushing schema to: ${testDbName}`);
    execSync(`npx prisma db push --force-reset --skip-generate`, {
      env: commandEnv,
      stdio: 'pipe',
      timeout: 90000,
    });

    if (testPrisma) {
      await testPrisma.$disconnect();
    }

    testPrisma = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
      log: ['error'], // Keep logging concise for tests
    });

    let connectionSuccess = false;
    for (let i = 0; i < 5; i++) {
      try {
        await testPrisma.$connect();
        connectionSuccess = true;
        break;
      } catch {
        console.warn(`Connection attempt ${i + 1} failed. Retrying in 1s...`);
        await sleep(1000);
      }
    }

    if (!connectionSuccess) {
      throw new Error('Could not connect to the test database after multiple retries.');
    }

    console.log(`✅ Test database ready: ${testDbName}`);

    return {
      databaseUrl,
      prismaClient: testPrisma,
      databaseName: testDbName,
    };
  } catch (error) {
    console.error(`❌ Test database setup failed:`, error);
    try {
      execSync(`dropdb --if-exists ${testDbName}`, {
        env: commandEnv,
        stdio: 'ignore',
        timeout: 30000,
      });
      console.log(`🧹 Cleaned up failed database: ${testDbName}`);
    } catch (cleanupError) {
      console.warn('Failed to cleanup test database on setup failure:', cleanupError);
    }
    // Re-throw the original error to fail the test suite
    throw new Error(`Test database setup failed: ${String(error)}`);
  }
}

export async function teardownTestDatabase(dbName?: string): Promise<void> {
  // Use the same secure environment for the cleanup command
  const commandEnv = {
    ...process.env,
    PGUSER: testEnv.db.user,
    PGPASSWORD: testEnv.db.password,
    PGHOST: testEnv.db.host,
    PGPORT: String(testEnv.db.port),
  };
  try {
    if (testPrisma) {
      console.log(`🔌 Disconnecting from test database...`);
      await testPrisma.$disconnect();
      testPrisma = null;
    }

    if (dbName) {
      console.log(`🗑️ Dropping test database: ${dbName}`);
      execSync(`dropdb --if-exists ${dbName}`, { env: commandEnv, stdio: 'pipe', timeout: 30000 });
      console.log(`✅ Test database dropped: ${dbName}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not cleanup test database ${dbName}:`, error);
  }
}

export async function truncateDatabase(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.like.deleteMany({});
    await prisma.tweet.deleteMany({});
    await prisma.follow.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('🧹 Database truncated successfully using Prisma Client');
  } catch (error) {
    console.error('Error: Could not truncate database:', error);
    throw error;
  }
}
