const { chromium } = require('@playwright/test');

const adminEmail = 'cs4218admin@test.com';
const adminPassword = 'cs4218admin@test.com';
const userEmail = 'cs4218@test.com';
const userPassword = 'cs4218@test.com';

async function globalSetup() {
  // --- ADMIN LOGIN ---
  const adminBrowser = await chromium.launch();
  const adminContext = await adminBrowser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3000/login');
  await adminPage.getByRole('textbox', { name: 'Enter Your Email' }).fill(adminEmail);
  await adminPage.getByRole('textbox', { name: 'Enter Your Password' }).fill(adminPassword);
  await adminPage.getByRole('button', { name: 'LOGIN' }).click();
  await adminPage.waitForLoadState('networkidle');
  await adminContext.storageState({ path: 'playwright-storage/admin.json' });
  await adminBrowser.close();

  // --- USER LOGIN ---
  const userBrowser = await chromium.launch();
  const userContext = await userBrowser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto('http://localhost:3000/login');
  await userPage.getByRole('textbox', { name: 'Enter Your Email' }).fill(userEmail);
  await userPage.getByRole('textbox', { name: 'Enter Your Password' }).fill(userPassword);
  await userPage.getByRole('button', { name: 'LOGIN' }).click();
  await userPage.waitForLoadState('networkidle');
  await userContext.storageState({ path: 'playwright-storage/user.json' });
  await userBrowser.close();
}

module.exports = globalSetup;
