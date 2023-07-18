import { expect, test } from '../playwright-utils.ts'

test('Test root error boundary caught', async ({ page }) => {
	await page.goto('/does-not-exist')

	await expect(page.getByText(/404 | not found/i)).toBeVisible()
	// TODO: figure out how to assert the 404 status code
})
