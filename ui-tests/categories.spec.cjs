import { execSync } from 'child_process';
import { test, expect } from '@playwright/test';
import slugify from 'slugify';

const storageStates = [
  { type: 'user', storageState: 'playwright-storage/user.json' },
  { type: 'admin', storageState: 'playwright-storage/admin.json' },
  { type: 'visitor', storageState: undefined },
];

for (const { type, storageState } of storageStates) { 
  test.describe(`Categories Page (${type}) - Non-DB related`, () => {

    test.use({ storageState: storageState });

    test('can navigate to page successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('load');
      await page.getByRole('link', { name: 'Categories' }).click();
      await page.getByRole('link', { name: 'All Categories' }).click();
      await expect(page).toHaveURL('/categories');
    });
  });

  test.describe(`Categories Page (${type}) - DB related`, () => {

    test.use({ storageState: storageState });

    test.beforeEach(async ({ } ) => {
      execSync('npm run db:reset', { stdio: 'inherit' });
    });
  
    test.afterEach(async ({ } ) => {
      execSync('npm run db:reset', { stdio: 'inherit' });
    });

    test('each category link navigates to correct url', async ({ page }) => {
      await page.goto('/categories');
      await page.waitForLoadState('load');
    
      const main = page.locator('main');
      const links = main.getByRole('link');
      const count = await links.count();
  
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const linkText = (await link.innerText()).trim();
        await link.click();
        await page.waitForLoadState('load');
        await expect(page).toHaveURL(`/category/${slugify(linkText, { lower: true })}`);
        await page.goBack();
        await page.waitForLoadState('load');
      }
    });
  });
}

