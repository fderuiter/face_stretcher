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
    
    canvas.toBlob(blob => {
      try {
        if (!blob) {
          throw new Error('[ERR_SH_002] Failed to create blob from canvas');
        }
        const url = globalThis.URL.createObjectURL(blob);
        const a = globalThis.document.createElement('a');
        a.href = url;
        a.download = 'stretchy-face.png';
        a.click();
        globalThis.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(`[ERR_SH_003] Download failed: ${error.message}`);
        throw error;
      }
    });
  } catch (error) {
    console.error(`Canvas capture failed: ${error.message}`);
    throw error;
  }
}
