import { exec } from 'child_process';
import { promisify } from 'util';
import { afterAll, beforeAll, vi } from 'vitest';

import { testEnv } from './test-env.config';

const execAsync = promisify(exec);

beforeAll(async () => {
  try {
    await execAsync('pg_isready -h localhost -p 5432');
    console.log('✅ PostgreSQL connection verified');
  } catch {
    throw new Error('❌ PostgreSQL is not running. Please start PostgreSQL first.');
  }
  vi.stubEnv('NODE_ENV', 'test');
  console.log('🚀 Integration test environment initialized');
}, 30000);

afterAll(async () => {
  vi.unstubAllEnvs();
  try {
    console.log('🧹 Starting final test database cleanup...');

    const command = `psql -h ${testEnv.db.host} -U ${testEnv.db.user} -d postgres -t -c "SELECT datname FROM pg_database WHERE datname LIKE 'test_db_%';"`;

    const { stdout } = await execAsync(command, {
      env: { ...process.env, PGPASSWORD: testEnv.db.password }, // 🌟 3. Use password from testEnv
      timeout: 20000,
    });

    const testDbs = stdout.split('\n').filter((db) => db.trim().startsWith('test_twitter_'));

    if (testDbs.length > 0) {
      console.log(`🧹 Cleaning up ${testDbs.length} orphaned test databases...`);
      for (const db of testDbs) {
        const dbName = db.trim();
        if (dbName) {
          try {
            await execAsync(`dropdb -U ${testEnv.db.user} --if-exists ${dbName}`, {
              env: { ...process.env, PGPASSWORD: testEnv.db.password },
              timeout: 15000,
            });
            console.log(`🗑️ Dropped orphaned database: ${dbName}`);
          } catch (error) {
            console.warn(`Warning: Could not drop orphaned database ${dbName}:`, error);
          }
        }
      }
    } else {
      console.log('✅ No orphaned test databases found to cleanup.');
    }
    console.log('🧹 Final cleanup completed.');
  } catch (error) {
    console.warn(
      'Warning: Could not perform final cleanup of test databases. This might be due to a connection issue or permissions.',
      error
    );
  }
}, 90000);
