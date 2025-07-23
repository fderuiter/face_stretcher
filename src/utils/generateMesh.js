import * as THREE from 'three';
import { createMesh } from './meshDeformer.js';

export const N64_SEGMENTS = 10;
export const HD_SEGMENTS = 100;
export const N64_TEXTURE_SIZE = 128;
export const HD_TEXTURE_SIZE = 512;

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

  const targetMax = n64Mode ? N64_TEXTURE_SIZE : HD_TEXTURE_SIZE;
  const aspect = source.width / source.height;
  const canvas = doc.createElement('canvas');
  if (source.width >= source.height) {
    canvas.width = targetMax;
    canvas.height = Math.round(targetMax / aspect);
  } else {
    canvas.height = targetMax;
    canvas.width = Math.round(targetMax * aspect);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('[ERR_MG_002] Could not get 2D context');
  }
  ctx.imageSmoothingEnabled = !n64Mode;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  // Scale so the longest side is 2 units and preserve aspect ratio
  const maxDim = Math.max(canvas.width, canvas.height);
  const width = (canvas.width / maxDim) * 2;
  const height = (canvas.height / maxDim) * 2;
  const segments = n64Mode ? N64_SEGMENTS : HD_SEGMENTS;
  return createMesh(texture, width, height, segments, n64Mode, curvature);
}
