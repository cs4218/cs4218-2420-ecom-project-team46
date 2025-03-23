import { test, expect } from '@playwright/test';
import fs from "fs";
import path from "path";
import { EJSON } from 'bson';

const parentDir = path.join(__dirname, '..');

const fileContent = fs.readFileSync(path.join(parentDir, './reset-mongodb/sample-data/test.users.json'), 'utf8');
const users = EJSON.parse(fileContent);

test.use({ storageState: 'playwright-storage/admin.json' });

test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Playwright Admin Account' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Users' }).click();

  users.forEach(async (user) => {
    await expect(page.getByRole('heading', { name: `User: ${user.name}` })).toBeVisible();
    await expect(page.getByText(`Email: ${user.email}`)).toBeVisible();
    await expect(page.getByText(`Phone: ${user.phone}`)).toBeVisible();
    await expect(page.getByText(`Address: ${user.address}`)).toBeVisible();
  });
});