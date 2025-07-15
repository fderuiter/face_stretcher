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
  const canvas = doc.createElement('canvas');
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('[ERR_AC_001] Could not get 2D context');
  }
  ctx.drawImage(
    image,
    bbox.x,
    bbox.y,
    bbox.width,
    bbox.height,
    0,
    0,
    bbox.width,
    bbox.height
  );
  return { canvas, bbox };
}
