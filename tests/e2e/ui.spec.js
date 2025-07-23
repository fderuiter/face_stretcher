import { test, expect } from '@playwright/test';

test.describe('UI interactions', () => {
  test('theme toggle persists across reload', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('instructionsSeen', 'yes'));
    await page.goto('/');
    await page.waitForSelector('#theme-toggle');
    // Wait for the script to initialize and set the theme in localStorage
    await page.waitForFunction(() => localStorage.getItem('theme') !== null);
    const initial = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.click('#theme-toggle');
    await page.waitForFunction(initialTheme => document.documentElement.getAttribute('data-theme') !== initialTheme, initial);
    const toggled = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(toggled).not.toBe(initial);
    await page.reload();
    const persisted = await page.evaluate(() => localStorage.getItem('theme'));
    expect(persisted).toBe(toggled);
  });

  test('instructions overlay hides after dismissal', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('instructionsSeen');
      const o = document.getElementById('instructions-overlay');
      if (o) o.classList.remove('hidden');
    });
    const overlay = page.locator('#instructions-overlay');
    await expect(overlay).toBeVisible();
    await page.evaluate(() => document.getElementById('close-instructions').click());
    // Wait for the overlay to become hidden after clicking
    await page.waitForFunction(() => document.getElementById('instructions-overlay').classList.contains('hidden'));
    await expect(overlay).toHaveClass(/hidden/);
    await page.reload();
    await expect(page.locator('#instructions-overlay')).toHaveClass(/hidden/);
  });
});
