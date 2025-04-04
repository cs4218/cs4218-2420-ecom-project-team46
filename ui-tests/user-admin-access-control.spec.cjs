import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

// These accounts are preset in the DB
const userEmail = 'cs4218@test.com';
const userPassword = 'cs4218@test.com';
const adminEmail = 'cs4218admin@test.com';
const adminPassword = 'cs4218admin@test.com';

test.describe('Access Control Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Reset the database before each test
    execSync('npm run db:reset', { stdio: 'inherit' });
    await page.goto('http://localhost:3000');
  });

  // Visitor Access Test
  test('as a visitor, I cannot access protected pages', async ({ page }) => {
    // Without logging in, attempt to visit a protected route
    await page.goto('http://localhost:3000/dashboard');

    // a redirect is expected
    await expect(page.getByRole('heading')).toContainText('Redirecting');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  // User Access Tests
  test('as a user, I cannot access admin-protected pages', async ({ page }) => {
    // Navigate to login page
    await page.getByRole('link', { name: 'Login' }).click();
    // Log in using regular user credentials
    await page.fill('input[placeholder="Enter Your Email"]', userEmail);
    await page.fill('input[placeholder="Enter Your Password"]', userPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Attempt to navigate to an admin-protected route
    await page.goto('http://localhost:3000/dashboard/admin');
    // a redirect is expected
    await expect(page.getByRole('heading')).toContainText('Redirecting');
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  // Admin Access Tests
  test('as an admin, I can access admin-protected pages', async ({ page }) => {
    // Navigate to login page
    await page.getByRole('link', { name: 'Login' }).click();
    // Log in using admin credentials
    await page.fill('input[placeholder="Enter Your Email"]', adminEmail);
    await page.fill('input[placeholder="Enter Your Password"]', adminPassword);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to an admin-protected route
    // involve clicking on account info then a dashboard link
    await page.getByRole('button', { name: 'Playwright Admin Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();

    // Verify that an element unique to the admin dashboard is visible.
    await expect(page.getByRole('main')).toContainText('Admin Panel');
  });

});
