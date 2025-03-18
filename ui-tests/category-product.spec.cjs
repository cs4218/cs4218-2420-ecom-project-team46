import { execSync } from 'child_process';
import { test, expect } from '@playwright/test';
import slugify from 'slugify';

const storageStates = [
  { type: 'user', storageState: 'playwright-storage/user.json' },
  { type: 'admin', storageState: 'playwright-storage/admin.json' },
  { type: 'visitor', storageState: undefined },
];
  
for (const { type, storageState } of storageStates) { 
  test.describe(`Category Product Page (${type}) - DB related`, () => {

    test.use({ storageState: storageState });

		test.beforeEach(async ({ } ) => {
		 execSync('npm run db:reset', { stdio: 'inherit' });
		});
		
		test.afterEach(async ({ } ) => {
		 execSync('npm run db:reset', { stdio: 'inherit' });
		});

		test('each category product page (linked from categories page) should render the key components correctly', async ({ page }) => {
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

				let catMain = page.locator('main');
				await expect(catMain).toContainText(new RegExp(`Category - ${linkText}`));

				const resultsText = await page.locator('h6').textContent();
				const match = resultsText?.match(/(\d+)\s+result found/i);
				const expectedCount = match ? parseInt(match[1], 10) : null;
				let catCount = 0;
				let cards;

				if (expectedCount > 0) {
					await page.waitForSelector('.card');
					cards = page.locator('.card');
					catCount = await cards.count();
				}

				expect(catCount).toBe(expectedCount);

				for (let j = 0; j < catCount; j++) {
					const card = cards.nth(j);
					await expect(card.getByRole('img')).toBeVisible();
					await expect(card.getByRole('heading').first()).toBeVisible();
					await expect(card.getByRole('button', { name: 'More Details' })).toBeVisible();
				}
				await page.goBack();
				await page.waitForLoadState('load');
			}
		});

    test('each product details page (linked from each product category page) should have correct url', async ({ page }) => {
			await page.goto('/categories');
			await page.waitForLoadState('load');
			
			const main = page.locator('main');
			const links = await main.getByRole('link');
			const count = await links.count();
		
			for (let i = 0; i < count; i++) {
				const link = links.nth(i);
				await link.click();
				await page.waitForLoadState('load');

				const resultsText = await page.locator('h6').textContent();
				const match = resultsText?.match(/(\d+)\s+result found/i);
				const expectedCount = match ? parseInt(match[1], 10) : null;
				let catCount = 0;
				let cards;

				if (expectedCount > 0) {
					await page.waitForSelector('.card');
					cards = page.locator('.card');
					catCount = await cards.count();
				}

				expect(catCount).toBe(expectedCount);

				for (let j = 0; j < catCount; j++) {
					const card = cards.nth(j);
					const productName = await card.getByRole('heading').first().textContent();
					await card.getByRole('button', { name: 'More Details' }).click();
					await page.waitForLoadState('load');
					
					await expect(page).toHaveURL(`/product/${slugify(productName, { lower: true })}`);
					await page.goBack();
					await page.waitForLoadState('load');
				}
				await page.goBack();
				await page.waitForLoadState('load');
			}
    });
  });
}
