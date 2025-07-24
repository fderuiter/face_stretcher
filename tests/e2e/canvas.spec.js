import { test, expect } from '@playwright/test';
import path from 'path';
import { mockBackendChecks } from './utils.js';

const imagePath = path.resolve('tests/test_face.jpg');

const mockScript = `
  export const SupportedModels = { MediaPipeFaceMesh: 'MediaPipeFaceMesh' };
  export function createDetector() {
    return Promise.resolve({
      estimateFaces: async () => [{ box: { xMin: 0, yMin: 0, xMax: 128, yMax: 128 } }]
    });
  }
`;

test('canvas output matches snapshot', async ({ page }) => {
  await mockBackendChecks(page);
  await page.route(/.*face-landmarks-detection.*\.js.*/, route => {
    route.fulfill({ contentType: 'application/javascript', body: mockScript });
  });

  await page.addInitScript(() => localStorage.setItem('instructionsSeen', 'yes'));
  await page.goto('/');
  await page.setInputFiles('#upload', imagePath);
  await page.waitForSelector('canvas#c');
  // Wait a moment to allow rendering
  await page.waitForTimeout(1000);
  await expect(page.locator('canvas#c')).toHaveScreenshot('canvas.png');
});
