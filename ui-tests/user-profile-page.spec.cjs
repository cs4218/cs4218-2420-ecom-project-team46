import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright-storage/user.json' });

test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Playwright User Account' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();

  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('Playwright User Account');
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('cs4218@test.com');
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('81234567');
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('1 Computing Drive');
});

test('test 2', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Playwright User Account' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();

  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('Playwright ');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('8123478');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('1 changi');
  await page.getByRole('button', { name: 'UPDATE' }).click();

  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('Playwright');
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('8123478');
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('cs4218@test.com');
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('1 changi');
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
});