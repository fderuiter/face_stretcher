export async function mockBackendChecks(page) {
  const mockBackend = `export async function assertBackendHealthy(){}`;
  await page.route(/.*backendChecks.*\.js.*/, route => {
    route.fulfill({ contentType: 'application/javascript', body: mockBackend });
  });
}

export async function mockFaceDetection(page, bbox = {xMin:0, yMin:0, xMax:128, yMax:128}) {
  const mockScript = `
    export const SupportedModels = { MediaPipeFaceMesh: 'MediaPipeFaceMesh' };
    export function createDetector() {
      return Promise.resolve({
        estimateFaces: async () => [ { box: ${JSON.stringify(bbox)} } ]
      });
    }
  `;
  await page.route(/.*face-landmarks-detection.*\.js.*/, route => {
    route.fulfill({ contentType: 'application/javascript', body: mockScript });
  });
}
