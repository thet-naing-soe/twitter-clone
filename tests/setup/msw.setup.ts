import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { handlers } from '../mocks/api-handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
