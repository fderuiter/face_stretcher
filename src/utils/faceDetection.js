import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { logError } from './analytics.js';

// Error codes:
// ERR_FD_001: General face detection failure
// ERR_FD_002: No face detected
// ERR_FD_003: Model loading failed
// ERR_FD_004: Invalid input image
// ERR_FD_005: WebGL context error
// ERR_FD_006: Memory allocation error

let modelPromise = null;

async function ensureBackend() {
  if (tf.getBackend()) return;
  try {
    await tf.setBackend('webgl');
    await tf.ready();
  } catch (e) {
    console.warn('WebGL backend failed, falling back to CPU', e);
    await tf.setBackend('cpu');
    await tf.ready();
  }
}

async function loadModel() {
  if (!modelPromise) {
    // Ensure we have a working backend before creating the detector. Some
    // browsers disable WebGL which can cause an empty detection result.
    await tf.ready();
    if (tf.findBackend('webgl')) {
      await tf.setBackend('webgl');
    } else if (tf.findBackend('wasm')) {
      await tf.setBackend('wasm');
    }

    modelPromise = faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      { runtime: 'tfjs' },
    );
  }
  return modelPromise;
}

export function __resetModel() {
  modelPromise = null;
}

/**
 * Returns a bbox {x, y, width, height} around the first detected face
 * or rejects if none found.
 */
export async function detectFace(imageElementOrCanvas) {
  try {
    if (!imageElementOrCanvas) {
      throw new Error('[ERR_FD_004] Invalid input image');
    }

    await ensureBackend();

    let model;
    try {
      model = await loadModel();
    } catch (error) {
      throw new Error(`[ERR_FD_003] Model loading failed: ${error.message}`);
    }

    try {
      const predictions = await model.estimateFaces(imageElementOrCanvas);
      if (!predictions.length) {
        throw new Error('[ERR_FD_002] No face detected');
      }
      const box = predictions[0].box;
      return {
        x: box.xMin,
        y: box.yMin,
        width: box.xMax - box.xMin,
        height: box.yMax - box.yMin,
      };
    } catch (error) {
      if (error.message.includes('No face detected') && typeof alert === 'function') {
        alert('No face detected in the image. Ensure the face is clearly visible and try cropping manually.');
      }
      if (error.message.includes('WebGL')) {
        throw new Error(`[ERR_FD_005] WebGL error: ${error.message}`);
      } else if (error.message.includes('memory')) {
        throw new Error(`[ERR_FD_006] Memory error: ${error.message}`);
      } else {
        throw new Error(`[ERR_FD_001] Face detection error: ${error.message}`);
      }
    }
  } catch (error) {
    logError(error);
    throw error;
  }
}
