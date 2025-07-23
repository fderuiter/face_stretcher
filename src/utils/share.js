import { logError } from './analytics.js';

// Error codes:
// ERR_SH_001: Canvas capture failed
// ERR_SH_002: Blob creation failed
// ERR_SH_003: Download initiation failed

/**
 * Capture the WebGL canvas and trigger a download
 */
export async function captureCanvas(
  canvas,
  doc = globalThis.document,
  urlObj = globalThis.URL,
) {
  try {
    if (!canvas || typeof canvas.toBlob !== 'function') {
      throw new Error('[ERR_SH_001] Invalid canvas element');
    }

    const blobResult = await new Promise((resolve) => canvas.toBlob(resolve));

    if (!blobResult) {
      throw new Error('[ERR_SH_002] Failed to create blob from canvas');
    }

    const url = urlObj.createObjectURL(blobResult);
    try {
      const a = doc.createElement('a');
      a.href = url;
      a.download = 'stretchy-face.png';
      a.click();
      urlObj.revokeObjectURL(url);
    } catch (error) {
      urlObj.revokeObjectURL(url);
      logError(new Error(`[ERR_SH_003] Download failed: ${error.message}`));
      throw new Error('[ERR_SH_003] Download failed');
    }
  } catch (error) {
    logError(new Error(`Canvas capture failed: ${error.message}`));
    throw error;
  }
}
