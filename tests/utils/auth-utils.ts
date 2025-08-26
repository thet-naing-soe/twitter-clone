import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function cleanDatabase(): Promise<void> {
  try {
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Database cleanup failed, continuing tests...', error);
  }
}

export async function createTestUser(email = 'test@example.com') {
  return await prisma.user.create({
    data: {
      email,
      username: 'Test User',
      emailVerified: new Date(),
    },
  });
}

export function createMockRequest(
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>
): NextRequest {
  const url = 'http://localhost:3000/api/auth/signin';

  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
