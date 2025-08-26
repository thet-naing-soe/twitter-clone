import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string; // Database user ID
    email?: string; // Email field (optional)
    name?: string; // Name field (optional)
    image?: string; // Profile image URL (optional)
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
  }
}
