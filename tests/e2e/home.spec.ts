import { test, expect } from '@playwright/test';

test.describe('Home screen', () => {
	test('renders the hero, filter panel, and a list of 27 journeys', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: /Ethiopia Permit & Public Service Journey Explorer/i })).toBeVisible();

		// Total count header
		await expect(page.locator('text=/^\\s*27\\s*$/').first()).toBeVisible();

		// Jurisdiction filter buttons
		await expect(page.getByRole('button', { name: 'Federal / National', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Regional / Sector regulator / TBD', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'City / Sub-city / Internal / Private', exact: true })).toBeVisible();

		// Search box
		await expect(page.getByPlaceholder(/Search journeys/i)).toBeVisible();
	});

	test('search narrows the journey list', async ({ page }) => {
		await page.goto('/');
		const search = page.getByPlaceholder(/Search journeys/i);

		await search.fill('restaurant');
		// After filtering the journey row matching "restaurant" should be visible
		await expect(page.getByRole('button', { name: /restaurant/i }).first()).toBeVisible();

		// "Clear all filters" should now be available
		await expect(page.getByRole('button', { name: /Clear all filters/i })).toBeVisible();
	});

	test('Cmd/Ctrl+K focuses the search input', async ({ page }) => {
		await page.goto('/');
		const search = page.locator('input[placeholder="Search journeys..."]').first();
		// Ensure it isn't auto-focused yet
		await page.getByRole('heading', { name: /Ethiopia Permit & Public Service Journey Explorer/i }).click();

		const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${mod}+KeyK`);
		await expect(search).toBeFocused();
	});

	test('jurisdiction filter toggles and affects the visible count', async ({ page }) => {
		await page.goto('/');
		const federal = page.getByRole('button', { name: 'Federal / National', exact: true });

		await federal.click();
		// "Clear all filters" appears once a filter is active
		await expect(page.getByRole('button', { name: /Clear all filters/i })).toBeVisible();

		await page.getByRole('button', { name: /Clear all filters/i }).click();
		await expect(page.getByRole('button', { name: /Clear all filters/i })).not.toBeVisible();
	});
});
