/**
 * Capture the WebGL canvas and trigger a download
 */
export function captureCanvas(canvas) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stretchy-face.png';
    a.click();
    URL.revokeObjectURL(url);
  });
}
