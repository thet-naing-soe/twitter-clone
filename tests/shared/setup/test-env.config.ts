import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

function getTestDbEnv() {
  const { TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_HOST, TEST_DB_PORT } = process.env;

  if (!TEST_DB_USER || !TEST_DB_PASSWORD || !TEST_DB_HOST || !TEST_DB_PORT) {
    throw new Error(
      'Missing required test database environment variables. Please check your .env.test file for TEST_DB_USER, TEST_DB_PASSWORD, TEST_DB_HOST, and TEST_DB_PORT.'
    );
  }

  return {
    user: TEST_DB_USER,
    password: TEST_DB_PASSWORD,
    host: TEST_DB_HOST,
    port: parseInt(TEST_DB_PORT, 10),
  };
}

// Export a single configuration object for the entire test suite
export const testEnv = {
  db: getTestDbEnv(),
};
