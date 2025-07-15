// Error codes:
// ERR_SH_001: Canvas capture failed
// ERR_SH_002: Blob creation failed
// ERR_SH_003: Download initiation failed

/**
 * Capture the WebGL canvas and trigger a download
 */
export function captureCanvas(canvas) {
  try {
    if (!canvas) {
      throw new Error('[ERR_SH_001] Invalid canvas element');
    }

    let blobResult = null;
    canvas.toBlob(b => {
      blobResult = b;
    });

    if (!blobResult) {
      throw new Error('[ERR_SH_002] Failed to create blob from canvas');
    }

    const url = (global.URL || URL).createObjectURL(blobResult);
    try {
      const a = (global.document || document).createElement('a');
      a.href = url;
      a.download = 'stretchy-face.png';
      a.click();
      (global.URL || URL).revokeObjectURL(url);
    } catch (error) {
      (global.URL || URL).revokeObjectURL(url);
      console.error(`[ERR_SH_003] Download failed: ${error.message}`);
      throw new Error('[ERR_SH_003] Download failed');
    }
  } catch (error) {
    console.error(`Canvas capture failed: ${error.message}`);
    throw error;
  }
}
