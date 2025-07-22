import { test, expect } from '@playwright/test';

test('homepage has upload area', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#upload-container')).toBeVisible();
});
