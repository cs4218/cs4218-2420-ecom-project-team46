import { execSync } from 'child_process';
import { test, expect } from '@playwright/test';
import slugify from 'slugify';

const storageStates = [
  { type: 'user', storageState: 'playwright-storage/user.json' },
  { type: 'admin', storageState: 'playwright-storage/admin.json' },
  { type: 'visitor', storageState: undefined },
];
  
for (const { type, storageState } of storageStates) { 
  test.describe(`Search Page (${type}) - DB related`, () => {

    test.use({ storageState: storageState });

		test.beforeEach(async ({ } ) => {
		 execSync('npm run db:reset', { stdio: 'inherit' });
		});
		
		test.afterEach(async ({ } ) => {
		 execSync('npm run db:reset', { stdio: 'inherit' });
		});

		test('search for non existent products should not return products', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('load');
			await page.getByRole('searchbox', { name: 'Search' }).click();
			await page.getByRole('searchbox', { name: 'Search' }).fill('nonexistentproductkeyword');
			await page.getByRole('button', { name: 'Search' }).click();
			await page.waitForLoadState('load');

			await expect(page.locator('h1')).toContainText('Search Results');
			await expect(page.locator('h6')).toContainText('No Products Found');
		});

		const searchTerms = ['Phone', 'book'];
		for (const term of searchTerms) {
			test(`search for existing products should return relevant products with key components rendered correctly with correct URLs - ${term}`, async ({ page }) => {
				await page.goto('/');
				await page.waitForLoadState('load');
				await page.getByRole('searchbox', { name: 'Search' }).click();
				await page.getByRole('searchbox', { name: 'Search' }).fill(term);
				await page.getByRole('button', { name: 'Search' }).click();
				await page.waitForLoadState('load');

				await expect(page.locator('h1')).toContainText('Search Results');

				const resultsText = await page.locator('h6').textContent();
				const match = resultsText?.match(/Found (\d+)/i);
				const expectedCount = match ? parseInt(match[1], 10) : null;
				let searchCount = 0;
				let cards;

				if (expectedCount > 0) {
					await page.waitForSelector('.card');
					cards = page.locator('.card');
					searchCount = await cards.count();
				}

				expect(searchCount).toBe(expectedCount);

				for (let j = 0; j < searchCount; j++) {
					const card = cards.nth(j);
					await expect(card.getByRole('img')).toBeVisible();
					const productName = await card.getByRole('heading').first().textContent();
					await expect(card).toContainText(new RegExp(term, 'i'));
					await expect(card.getByRole('button', { name: 'ADD TO CART' })).toBeVisible();
					await card.getByRole('button', { name: 'More Details' }).click();
					await page.waitForLoadState('load');
					
					await expect(page).toHaveURL(`/product/${slugify(productName, { lower: true })}`);
					await page.goBack();
					await page.waitForLoadState('load');
				}
			});
		}

		test(`search for existing products and adding them to cart should show up in cart`, async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('load');
			await page.getByRole('searchbox', { name: 'Search' }).click();
			await page.getByRole('searchbox', { name: 'Search' }).fill('Phone');
			await page.getByRole('button', { name: 'Search' }).click();
			await page.waitForLoadState('load');

			const resultsText = await page.locator('h6').textContent();
			const match = resultsText?.match(/Found (\d+)/i);
			const expectedCount = match ? parseInt(match[1], 10) : null;
			let cards;

			if (expectedCount > 0) {
				await page.waitForSelector('.card');
				cards = page.locator('.card');

				const card = cards.first();
				const productName = await card.getByRole('heading').first().textContent();
				await card.getByRole('button', { name: 'ADD TO CART' }).click();
				await expect(page.getByRole('status')).toContainText('Item Added to cart');
				await expect(page.getByRole('status')).not.toBeVisible(); 
				await expect(page.locator('bdi')).toContainText('1');

				await page.goto('/cart');
				await page.waitForLoadState('load');
				await expect(page.getByRole('main')).toContainText(productName);
			}
		});

		test(`search for existing products and adding them to cart multiple times should show up in cart multiple times`, async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('load');
			await page.getByRole('searchbox', { name: 'Search' }).click();
			await page.getByRole('searchbox', { name: 'Search' }).fill('Phone');
			await page.getByRole('button', { name: 'Search' }).click();
			await page.waitForLoadState('load');

			const resultsText = await page.locator('h6').textContent();
			const match = resultsText?.match(/Found (\d+)/i);
			const expectedCount = match ? parseInt(match[1], 10) : null;
			let cards;

			if (expectedCount > 0) {
				await page.waitForSelector('.card');
				cards = page.locator('.card');

				const card = cards.first();
				const productName = await card.getByRole('heading').first().textContent();
				await card.getByRole('button', { name: 'ADD TO CART' }).click();
				await expect(page.getByRole('status')).toContainText('Item Added to cart');
				await expect(page.getByRole('status')).not.toBeVisible(); 

				await card.getByRole('button', { name: 'ADD TO CART' }).click();
				await expect(page.getByRole('status')).toContainText('Item Added to cart');
				await expect(page.getByRole('status')).not.toBeVisible(); 

				await card.getByRole('button', { name: 'ADD TO CART' }).click();
				await expect(page.getByRole('status')).toContainText('Item Added to cart');
				await expect(page.getByRole('status')).not.toBeVisible(); 

				await expect(page.locator('bdi')).toContainText('3');

				await page.goto('/cart');
				await page.waitForLoadState('load');
				
				await page.waitForSelector('.card');
				const cartCards = page.locator('.card');
				const cartCount = await cartCards.count();

				await expect(page.getByRole('main')).toContainText(productName);
				expect(cartCount).toBe(3);
			}
		});
	});
}
