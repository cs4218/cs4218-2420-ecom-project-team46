import { execSync } from 'child_process';
import { test, expect } from '@playwright/test';
import slugify from 'slugify';

const storageStates = [
  { type: 'user', storageState: 'playwright-storage/user.json' },
  { type: 'admin', storageState: 'playwright-storage/admin.json' },
  { type: 'visitor', storageState: undefined },
];

test.describe('Create Category Page (Admin) - Non-DB related', () => {

  test.use({ storageState: 'playwright-storage/admin.json' });

  test('admin can navigate to page successfully', async ({ page }) => {
    await page.goto('/');
		await page.waitForLoadState('load');
    await page.getByRole('button', { name: 'Playwright Admin Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    await expect(page).toHaveURL('/dashboard/admin/create-category');
  });

  test('key components are rendered in page', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });
});

test.describe('Create Category Page (Admin) - DB related', () => {

  test.use({ storageState: 'playwright-storage/admin.json' });

  test.beforeEach(async ({ } ) => {
    execSync('npm run db:reset', { stdio: 'inherit' });
  });
  
  test.afterEach(async ({ } ) => {
    execSync('npm run db:reset', { stdio: 'inherit' });
  });

  test('should reflect new category in page after category creation', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('New Category');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('New Category is created');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.locator('tbody')).toContainText('New Category');
  });

  test('should show error message when no input given during category creation', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('Something went wrong in input form');
    await expect(page.getByRole('status')).not.toBeVisible({ timeout: 10000 });
  });

  test('should indicate success with no duplicated category when creating new category with same name as existing category', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('Book');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('Book is created');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Book' })).toHaveCount(1);
  });

  test('should reflect updated category name after category update', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await page.getByRole('button', { name: 'Edit' }).nth(2).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Apparel');
    await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('status')).toContainText('Apparel is updated');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.locator('tbody')).not.toContainText('Clothing');
    await expect(page.locator('tbody')).toContainText('Apparel');
  });

  test('should return error message when updating category name that is the same as another category', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await page.getByRole('button', { name: 'Edit' }).nth(2).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Book');
    await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('Something went wrong');
    await expect(page.getByRole('status')).not.toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('tbody')).toContainText('Clothing');
    await expect(page.getByRole('cell', { name: 'Book' })).toHaveCount(1);
  });

  test('should not show deleted category name after category deletion', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await page.getByRole('button', { name: 'Delete' }).nth(1).click();
    await expect(page.getByRole('status')).toContainText('Category is deleted');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.locator('tbody')).not.toContainText('Book');
  });
});

test.describe('Create Category Page (User) - Non-DB related', () => {

  test.use({ storageState: 'playwright-storage/user.json' });

  test('user must not have access to create category page', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Create Category Page (Not logged in) - Non-DB related', () => {

  test.use({ storageState: undefined });

  test('non-logged in visitors must not have access to create category page', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
		await page.waitForLoadState('load');
    await expect(page).toHaveURL(/\/login/);
  });
});

for (const { type, storageState } of storageStates) { 
  
  test.describe(`Categories Links (${type}) - DB related`, () => {

    test.use({ storageState: storageState });

    test.beforeEach(async ({ } ) => {
      execSync('npm run db:reset', { stdio: 'inherit' });
    });
    
    test.afterEach(async ({ } ) => {
      execSync('npm run db:reset', { stdio: 'inherit' });
    });

    test('should reflect newly created category in header dropdown and in categories page after category creation', async ({ browser }) => {
      
      // Create new category (as Admin)
      const adminContext = await browser.newContext({ storageState: 'playwright-storage/admin.json' });
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`/dashboard/admin/create-category`);
			await adminPage.waitForLoadState('load');
      await adminPage.getByRole('textbox', { name: 'Enter new category' }).fill('New Category');
      await adminPage.getByRole('button', { name: 'Submit' }).click();
      await expect(adminPage.locator('tbody')).toContainText('New Category');
      await adminContext.close();
      
      // Check header for new category
      const userContext = await browser.newContext({ storageState: storageState });
      const userPage = await userContext.newPage();
      
      await userPage.goto('/');
			await userPage.waitForLoadState('load');
      await userPage.getByRole('link', { name: 'Categories', exact: true }).click();
      await expect(userPage.locator('#navbarTogglerDemo01').getByRole('link', { name: 'New Category' })).toBeVisible();
      await userPage.locator('#navbarTogglerDemo01').getByRole('link', { name: 'New Category' }).click();
      await userPage.waitForLoadState('load');
      await expect(userPage).toHaveURL(`/category/${slugify('New Category', { lower: true })}`);

      // Check all categories page for new category
      await userPage.getByRole('link', { name: 'Categories', exact: true }).click();
      await userPage.getByRole('link', { name: 'All Categories', exact: true }).click();
      const main = userPage.locator('main');
      await expect(main.getByRole('link', { name: 'New Category' })).toBeVisible();
      await main.getByRole('link', { name: 'New Category' }).click();
      await userPage.waitForLoadState('load');
      await expect(userPage).toHaveURL(`/category/${slugify('New Category', { lower: true })}`);
      
      await userContext.close();
    });

    test('should reflect updated category name in header dropdown and categories page after category update', async ({ browser }) => {
      
      // Create new category (as Admin)
      const adminContext = await browser.newContext({ storageState: 'playwright-storage/admin.json' });
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`/dashboard/admin/create-category`);
			await adminPage.waitForLoadState('load');
      await adminPage.getByRole('button', { name: 'Edit' }).nth(2).click();
      await adminPage.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
      await adminPage.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Apparel');
      await adminPage.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
      await expect(adminPage.locator('tbody')).toContainText('Apparel');
      await expect(adminPage.locator('tbody')).not.toContainText('Clothing');
      await adminContext.close();
      
      // Check header for updated category
      const userContext = await browser.newContext({ storageState: storageState });
      const userPage = await userContext.newPage();
      
      await userPage.goto('/');
			await userPage.waitForLoadState('load');
      await userPage.getByRole('link', { name: 'Categories', exact: true }).click();
      await expect(userPage.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Apparel' })).toBeVisible();
      await expect(userPage.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Clothing' })).not.toBeVisible();
      await userPage.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Apparel' }).click();
      await userPage.waitForLoadState('load');
      await expect(userPage).toHaveURL(`/category/${slugify('Apparel', { lower: true })}`);

      // Check all categories page for updated category
      await userPage.getByRole('link', { name: 'Categories', exact: true }).click();
      await userPage.getByRole('link', { name: 'All Categories', exact: true }).click();
      const main = userPage.locator('main');
      await expect(main.getByRole('link', { name: 'Clothing' })).not.toBeVisible();
      await expect(main.getByRole('link', { name: 'Apparel'})).toBeVisible();
      await main.getByRole('link', { name: 'Apparel' }).click();
      await userPage.waitForLoadState('load');
      await expect(userPage).toHaveURL(`/category/${slugify('Apparel', { lower: true })}`);
      
      await userContext.close();
    });

    test('should not show deleted category name in header dropdown and categories page after category deletion', async ({ browser }) => {
      
      // Create new category (as Admin)
      const adminContext = await browser.newContext({ storageState: 'playwright-storage/admin.json' });
      const adminPage = await adminContext.newPage();
      await adminPage.goto(`/dashboard/admin/create-category`);
			await adminPage.waitForLoadState('load');
      await adminPage.getByRole('button', { name: 'Delete' }).nth(1).click();
      await expect(adminPage.getByRole('status')).toContainText('Category is deleted');
      await expect(adminPage.getByRole('status')).not.toBeVisible();
      await expect(adminPage.locator('tbody')).not.toContainText('Book');
      await adminContext.close();
      
      // Check header for deleted category
      const userContext = await browser.newContext({ storageState: storageState });
      const userPage = await userContext.newPage();
      
      await userPage.goto('/');
			await userPage.waitForLoadState('load');
      await userPage.getByRole('link', { name: 'Categories', exact: true }).click();
      await expect(userPage.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Book' })).not.toBeVisible();

      // Check all categories page for deleted category
      await userPage.getByRole('link', { name: 'All Categories', exact: true }).click();
      const main = userPage.locator('main');
      await expect(main.getByRole('link', { name: 'Book' })).not.toBeVisible();
      
      await userContext.close();
    });
  });
}