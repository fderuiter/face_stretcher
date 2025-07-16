const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('initial UI state', async ({ page }) => {
  await expect(page.locator('#upload-container')).toBeVisible();
  await expect(page.locator('#cropper-container')).toBeHidden();
  await expect(page.locator('#loading-bar-container')).toBeHidden();
});

test('upload input is available', async ({ page }) => {
  const input = page.locator('#upload');
  await expect(input).toHaveAttribute('type', 'file');
});
