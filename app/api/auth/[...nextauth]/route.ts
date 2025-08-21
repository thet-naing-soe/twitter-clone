import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth';

interface AuthHandler {
  GET: (req: NextRequest) => Promise<Response>;
  POST: (req: NextRequest) => Promise<Response>;
}

const handler = NextAuth(authOptions) as AuthHandler;

export { handler as GET, handler as POST };

export const authHandler = handler;
