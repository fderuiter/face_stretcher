export function generateShareLink(canvas, locationObj = globalThis.location) {
  if (!canvas || typeof canvas.toDataURL !== 'function') {
    throw new Error('[ERR_SL_001] Invalid canvas element');
  }
  const dataUrl = canvas.toDataURL('image/png');
  const url = new URL(locationObj.href);
  url.searchParams.set('img', dataUrl);
  return url.toString();
}

export function loadSharedImage(locationObj = globalThis.location) {
  const url = new URL(locationObj.href);
  const dataUrl = url.searchParams.get('img');
  if (!dataUrl) return null;
  const img = new Image();
  img.src = dataUrl;
  return img;
}
