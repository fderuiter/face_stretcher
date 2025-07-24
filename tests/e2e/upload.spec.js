import { test, expect } from '@playwright/test';
import path from 'path';
import { mockBackendChecks, mockFaceDetection } from './utils.js';

const imagePath = path.resolve('tests/test_face.jpg');

test('image upload works', async ({ page }) => {
  await mockBackendChecks(page);
  await mockFaceDetection(page);
  await page.addInitScript(() => localStorage.setItem('instructionsSeen', 'yes'));
  await page.goto('/');
  await page.setInputFiles('#upload', imagePath);
  await page.waitForSelector('canvas#c');
  await expect(page.locator('#upload-container')).toHaveClass(/hidden/);
  // canvas should be visible after upload
  await expect(page.locator('canvas#c')).toBeVisible();
});
