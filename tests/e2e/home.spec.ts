import { test, expect } from '@playwright/test';

test.describe('Home screen', () => {
	test('renders the hero, filter panel, and a list of 27 journeys', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: /Ethiopia Permit & Public Service Journey Explorer/i })).toBeVisible();

		// Total count header
		await expect(page.locator('text=/^\\s*27\\s*$/').first()).toBeVisible();

		// Responsible level filter buttons
		await expect(page.getByText('By Responsible Level', { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Federal / National', exact: true }).first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Addis Ababa City Administration', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Private / Non-government Actor', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Applicant / Internal Action', exact: true })).toBeVisible();

		// Broad data group filter buttons
		await expect(page.getByText('By Broad Data Group', { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Federal / National', exact: true }).nth(1)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Regional / Sector regulator / TBD', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'City / Sub-city / Internal / Private', exact: true })).toBeVisible();

		// Audience filter buttons
		await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Business', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Individual', exact: true })).toBeVisible();

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
		const federal = page.getByRole('button', { name: 'Federal / National', exact: true }).nth(1);

		await federal.click();
		// "Clear all filters" appears once a filter is active
		await expect(page.getByRole('button', { name: /Clear all filters/i })).toBeVisible();

		await page.getByRole('button', { name: /Clear all filters/i }).click();
		await expect(page.getByRole('button', { name: /Clear all filters/i })).not.toBeVisible();
	});

	test('responsible level filter works with clear filters', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: 'Private / Non-government Actor', exact: true }).click();
		await expect(page.getByRole('button', { name: /Clear all filters/i })).toBeVisible();
		await expect(page.locator('button.journey-row').first()).toBeVisible();

		await page.getByRole('button', { name: /Clear all filters/i }).click();
		await expect(page.locator('text=/^\\s*27\\s*$/').first()).toBeVisible();
	});

	test('audience filter switches between all, business, and individual journeys', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('button', { name: 'Professional Services', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Individual Services - Tax', exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Business', exact: true }).click();
		await expect(page.locator('text=/^\\s*11\\s*$/').first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Professional Services', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Individual Services - Tax', exact: true })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /Clear all filters/i })).toBeVisible();

		await page.getByRole('button', { name: /Clear all filters/i }).click();
		await expect(page.locator('text=/^\\s*27\\s*$/').first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Professional Services', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Individual Services - Tax', exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Individual', exact: true }).click();
		await expect(page.locator('text=/^\\s*16\\s*$/').first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Individual Services - Tax', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Professional Services', exact: true })).not.toBeVisible();

		await page.getByRole('button', { name: 'All', exact: true }).click();
		await expect(page.locator('text=/^\\s*27\\s*$/').first()).toBeVisible();
	});

	test('audience changes remove unavailable category filters', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: 'Individual', exact: true }).click();
		await page.getByRole('button', { name: 'Individual Services - Tax', exact: true }).click();
		await expect(page.locator('text=/^\\s*2\\s*$/').first()).toBeVisible();

		await page.getByRole('button', { name: 'Business', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Individual Services - Tax', exact: true })).not.toBeVisible();
		await expect(page.locator('text=/^\\s*11\\s*$/').first()).toBeVisible();
	});
});
