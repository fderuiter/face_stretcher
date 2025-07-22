import * as THREE from 'three';
import { createMesh } from './meshDeformer.js';

export const N64_SEGMENTS = 10;
export const HD_SEGMENTS = 100;

// Error codes:
// ERR_MG_001: Invalid source image
// ERR_MG_002: Could not get 2D context

/**
 * Generates a deformable face mesh from a cropped image or canvas.
 * @param {HTMLCanvasElement|HTMLImageElement} source - Cropped face image/canvas
 * @param {boolean} n64Mode - If true, use low-poly pixelated mesh
 * @param {number} curvature - 0 for flat plane, 1 for full hemisphere
 * @param {Document} doc - Document to create a canvas (for tests)
 * @returns {THREE.Mesh}
 */
export function generateMesh(source, n64Mode = true, curvature = 0, doc = globalThis.document) {
  if (!source || !source.width || !source.height) {
    throw new Error('[ERR_MG_001] Invalid source image');
  }

  let canvas;
  if (source instanceof HTMLCanvasElement) {
    canvas = source;
  } else {
    canvas = doc.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('[ERR_MG_002] Could not get 2D context');
    }
    ctx.drawImage(source, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const width = 2;
  const height = 2 * (canvas.height / canvas.width);
  const segments = n64Mode ? N64_SEGMENTS : HD_SEGMENTS;
  return createMesh(texture, width, height, segments, n64Mode, curvature);
}
