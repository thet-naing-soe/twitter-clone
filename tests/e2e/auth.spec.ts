import { expect, test } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(() => {
    console.log('Setting up test environment');
  });

  test('user can login and maintain session', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('text=Sign In')).toBeVisible();

    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Check your email')).toBeVisible();
  });

  test('unauthenticated user should be redirected to login from protected page', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/.*login/);
  });

  test('user can logout and session should be cleared', async ({ page }) => {
    await page.locator('button:has-text("Sign Out")').click();

    await expect(page).toHaveURL(/.*login/);

    await page.reload();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('authenticated user should remain logged in after page refresh', async ({ page }) => {
    await page.goto('/dashboard');

    await page.reload();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
