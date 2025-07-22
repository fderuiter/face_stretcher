import { detectFace } from './faceDetection.js';

// Error codes:
// ERR_AC_001: Could not obtain 2D context

/**
 * Automatically detects the face in an image element and returns a cropped canvas.
 * @param {HTMLImageElement|HTMLCanvasElement} image Image to detect and crop
 * @param {Document} doc Document to create canvas (for testing)
 * @returns {Promise<{canvas: HTMLCanvasElement, bbox: {x:number,y:number,width:number,height:number}}>} Result
 */
export async function autoCrop(image, doc = globalThis.document) {
  const bbox = await detectFace(image);

  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  const size = Math.max(bbox.width, bbox.height);
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  let x = Math.round(centerX - size / 2);
  let y = Math.round(centerY - size / 2);
  x = Math.max(0, Math.min(x, imgW - size));
  y = Math.max(0, Math.min(y, imgH - size));

  const canvas = doc.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('[ERR_AC_001] Could not get 2D context');
  }
  ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
  return { canvas, bbox: { x, y, width: size, height: size } };
}
