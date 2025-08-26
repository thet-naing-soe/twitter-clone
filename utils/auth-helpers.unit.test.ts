import { describe, expect, it } from 'vitest';

import {
  hashPassword,
  isSessionExpired,
  isValidEmail,
  serializeUser,
  verifyPassword,
} from './auth-helpers';

describe('Auth Helpers', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password and be able to verify it', async () => {
      const password = 'mySecretPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);

      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hashed = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('serializeUser', () => {
    it('should only include required fields from user object', () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
        internalField: 'should not appear',
      } as any;

      const serialized = serializeUser(mockUser);

      expect(serialized).toEqual({
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      });

      expect(serialized).not.toHaveProperty('internalField');
    });
  });

  describe('isSessionExpired', () => {
    it('should detect past date as expired', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      expect(isSessionExpired(pastDate)).toBe(true);
    });

    it('should detect future date as active', () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute later
      expect(isSessionExpired(futureDate)).toBe(false);
    });
  });
});
