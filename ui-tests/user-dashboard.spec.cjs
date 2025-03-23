import { test, expect } from '@playwright/test';

test.use({ storageState: "playwright-storage/user.json" });

test('should show user details', async ({ page }) => {
  await page.goto('/dashboard/user');
  await expect(page.getByRole('heading', { name: 'Playwright User Account' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'cs4218@test.com' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Computing Drive' })).toBeVisible();
});

test('should show user menu', async ({ page }) => {
  await page.goto('/dashboard/user');
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
});
