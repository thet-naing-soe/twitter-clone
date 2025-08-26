import type { User } from 'next-auth';
import { compare, hash } from 'bcryptjs';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function serializeUser(user: User): {
  id: string;
  email: string;
  name?: string;
  image?: string;
} {
  return {
    id: user.id,
    email: user.email!,
    name: user.name ?? undefined,
    image: user.image ?? undefined,
  };
}

export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
