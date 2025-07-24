import { test, expect } from '@playwright/test';
import { mockBackendChecks } from './utils.js';

test('homepage has upload area', async ({ page }) => {
  await mockBackendChecks(page);
  await page.goto('/');
  await expect(page.locator('#upload-container')).toBeVisible();
});
