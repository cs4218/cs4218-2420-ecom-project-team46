import { execSync } from 'child_process';
import { test, expect } from '@playwright/test';


test.describe('Create Category Page (Admin) - Non-DB related', () => {

  test.use({ storageState: 'playwright-storage/admin.json' });

  test('admin can navigate to page successfully', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Playwright Admin Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
  });

  test('key components must be visible', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
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

  test('category creation should reflect new category', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('New Category');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('New Category is created');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.locator('tbody')).toContainText('New Category');
  });

  test('category creation with no inputs should show error message', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin/create-category');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('Something went wrong in input form');
    await expect(page.getByRole('status')).not.toBeVisible({ timeout: 10000 });
  });

  test('category creation for existing category should indicate success with no duplicated category', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/admin/create-category');
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('Book');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('Book is created');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Book' })).toHaveCount(1);
  });

  test('category update should reflect updated category', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
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

  test('category deletion should not show deleted category', async ({ page }) => {
    await page.goto('/dashboard/admin/create-category');
    await page.getByRole('button', { name: 'Delete' }).nth(1).click();
    await expect(page.getByRole('status')).toContainText('Category is deleted');
    await expect(page.getByRole('status')).not.toBeVisible();
    await expect(page.locator('tbody')).not.toContainText('Book');
  });
});

test.describe('Create Category Page (User) - Non-DB related', () => {

  test.use({ storageState: 'playwright-storage/user.json' });

  test('user must not have access to create category page', async ({ page }) => {
    await page.goto('/dashboard/dashboard/admin/create-category');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oops ! Page Not Found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  });
});

test.describe('Create Category Page (Not logged in) - Non-DB related', () => {

  test.use({ storageState: undefined });

  test('non logged in visitors must not have access to create category page', async ({ page }) => {
    await page.goto('/dashboard/dashboard/admin/create-category');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oops ! Page Not Found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  });
});
