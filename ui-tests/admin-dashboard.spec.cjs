import { test, expect } from '@playwright/test';

test.use({ storageState: "playwright-storage/admin.json" });

test('should show user details', async ({ page }) => {
  await page.goto('/dashboard/admin');
  await expect(page.getByRole('heading', { name: 'Admin Name : Playwright Admin Account' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Email : cs4218admin@test.com' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin Contact : 81234567' })).toBeVisible();
});

test('should show user menu', async ({ page }) => {
  await page.goto('/dashboard/admin');
  await expect(page.getByRole('link', { name: 'Create Category' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
});
