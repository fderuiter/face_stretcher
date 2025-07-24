import { test, expect } from '@playwright/test';
import path from 'path';
import { mockBackendChecks } from './utils.js';

const imagePath = path.resolve('tests/test_face.jpg');

// Mock the TensorFlow face detection model so estimateFaces returns no results
const mockScript = `
  export const SupportedModels = { MediaPipeFaceMesh: 'MediaPipeFaceMesh' };
  export function createDetector() {
    return Promise.resolve({
      estimateFaces: async () => []
    });
  }
`;

test('manual cropper appears when auto detection finds no faces', async ({ page }) => {
  // Intercept the module request from Vite
  await page.route(/.*face-landmarks-detection.*\.js.*/, route => {
    route.fulfill({ contentType: 'application/javascript', body: mockScript });
  });

  await mockBackendChecks(page);

  await page.addInitScript(() => localStorage.setItem('instructionsSeen', 'yes'));
  await page.goto('/');
  await page.setInputFiles('#upload', imagePath);
  await page.waitForSelector('#cropper-container');
  await expect(page.locator('#cropper-container')).toBeVisible();
});
