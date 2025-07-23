import { test, expect } from '@playwright/test';

test.describe('UI interactions', () => {
  test('theme toggle persists across reload', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('instructionsSeen', 'yes'));
    await page.goto('/');
    await page.waitForSelector('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
    const initial = await page.getAttribute('html', 'data-theme');
    await page.click('#theme-toggle');
    const toggled = await page.getAttribute('html', 'data-theme');
    expect(toggled).not.toBe(initial);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', toggled);
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
    await expect(overlay).toHaveClass(/hidden/);
    await page.reload();
    await expect(overlay).toHaveClass(/hidden/);
  });
});
