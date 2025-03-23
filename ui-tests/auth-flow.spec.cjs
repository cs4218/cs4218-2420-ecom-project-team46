import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Authentication UI Tests', () => {
  // Pre-test DB reset if necessary
  test.beforeEach(async ({ page }) => {
    // Reset the database
    execSync('npm run db:reset', { stdio: 'inherit' });
    // Go to main page
    await page.goto('http://localhost:3000');
  });
  
  test('user can register for a new account, then log in successfully', async ({ page }) => {
    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();

    // Fill out the registration form
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('ui');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('ui@test.com');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-03-23');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('ui@test.com');

    // Submit the registration form
    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Expect a success toast and navigation to login page
    await expect(page.getByText(/Register Successfully, please login/i)).toBeVisible();
    await expect(page.getByRole('main')).toContainText('LOGIN FORM');

    // Fill out the login form with valid credentials
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('ui@test.com');

    // Submit the login form
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    // Expect a success toast and that the user name is displayed
    await expect(page.getByText(/login successfully/i)).toBeVisible();
    await expect(page.getByRole('list')).toContainText('ui');
  });

  test('no two repeated users can register', async ({ page }) => {
    // First registration
    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('ui');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('ui@test.com');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-03-23');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('ui@test.com');

    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Wait for navigation to login page after first registration
    await expect(page.getByRole('main')).toContainText('LOGIN FORM');

    // Navigate back to registration page for duplicate registration
    await page.getByRole('link', { name: 'Register' }).click();

    // Fill out the registration form with the same data
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('ui');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('ui@test.com');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-03-23');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('ui@test.com');

    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Expect an error message indicating duplicate registration is not allowed.
    await expect(page.getByText(/Already Register please login/i)).toBeVisible();
  });

  test('should show error on login when password is incorrect after registration', async ({ page }) => {
    // Navigate to registration page and register a new user
    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('ui');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('ui@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('ui@test.com');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-03-23');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('ui@test.com');

    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Wait for the login page to appear
    await expect(page.getByRole('main')).toContainText('LOGIN FORM');

    // Fill out the login form with an incorrect password
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('ui@test.com');
    // Use an incorrect password
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('wrongpassword');

    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    // Expect an error message indicating invalid credentials
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  // Additional test cases for Forgot Password
  test('should show error on forgot password with wrong security answer after registration', async ({ page }) => {
    // Navigate to registration page and register a new user
    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('wrongTest');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('wrong@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('correctPassword');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('1234567890');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('some address');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-03-23');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('basketball');

    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Expect registration success and navigation to login page
    await expect(page.getByText(/Register Successfully, please login/i)).toBeVisible();
    await expect(page.getByRole('main')).toContainText('LOGIN FORM');

    // Navigate to forgot password page
    await page.getByRole('button', { name: 'Forgot Password' }).click();

    // Fill out forgot password form with wrong security answer
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('wrong@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('wrongAnswer');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newPassword123');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    // Expect an error message indicating the wrong answer was provided
    await expect(page.getByText(/Wrong Email Or Answer/i)).toBeVisible();
  });

  test('should allow user to reset password successfully after registration and then log in with new password', async ({ page }) => {
    // Navigate to registration page and register a new user
    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('resetTest');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('reset@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('oldPassword');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('1234567890');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('some address');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-03-23');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('football');

    await page.getByRole('button', { name: 'REGISTER' }).click();

    // Expect registration success and navigation to login page
    await expect(page.getByText(/Register Successfully, please login/i)).toBeVisible();
    await expect(page.getByRole('main')).toContainText('LOGIN FORM');

    // Navigate to forgot password page
    await page.getByRole('button', { name: 'Forgot Password' }).click();

    // Fill out forgot password form with correct security answer to reset password
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('reset@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('football');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newPassword');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    // Expect navigation to login page after successful password reset
    await expect(page.getByText(/LOGIN FORM/i)).toBeVisible();

    // Attempt to log in with the new password
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('reset@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newPassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    // Expect a success message and that the user's name is displayed
    await expect(page.getByText(/login successfully/i)).toBeVisible();
    await expect(page.getByRole('list')).toContainText('resetTest');
  });
});
