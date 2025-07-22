import { test, expect } from '@playwright/test';

test.describe('UI interactions', () => {
  test('theme toggle persists across reload', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('instructionsSeen', 'yes'));
    await page.goto('/');
    await page.waitForSelector('#theme-toggle');
    const initial = await page.getAttribute('html', 'data-theme');
    await page.click('#theme-toggle');
    const toggled = await page.getAttribute('html', 'data-theme');
    expect(toggled).not.toBe(initial);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', toggled);
  });

  test('instructions overlay hides after dismissal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#instructions-overlay')).toBeVisible();
    await page.click('#close-instructions');
    await expect(page.locator('#instructions-overlay')).toBeHidden();
    await page.reload();
    await expect(page.locator('#instructions-overlay')).toBeHidden();
  });
});
