import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

// Error codes:
// ERR_FD_001: General face detection failure
// ERR_FD_002: No face detected
// ERR_FD_003: Model loading failed
// ERR_FD_004: Invalid input image
// ERR_FD_005: WebGL context error
// ERR_FD_006: Memory allocation error

let model = null;

/**
 * Returns a bbox {x, y, width, height} around the first detected face
 * or rejects if none found.
 */
export async function detectFace(imageElementOrCanvas) {
  try {
    if (!imageElementOrCanvas) {
      throw new Error('[ERR_FD_004] Invalid input image');
    }

    if (!model) {
      try {
        model = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );
      } catch (error) {
        throw new Error(`[ERR_FD_003] Model loading failed: ${error.message}`);
      }
    }

    try {
      const predictions = await model.estimateFaces({input: imageElementOrCanvas});
      if (!predictions.length) {
        throw new Error('[ERR_FD_002] No face detected');
      }
      const box = predictions[0].box;
      return {
        x: box.xMin,
        y: box.yMin,
        width: box.xMax - box.xMin,
        height: box.yMax - box.yMin
      };
    } catch (error) {
      if (error.message.includes('WebGL')) {
        throw new Error(`[ERR_FD_005] WebGL error: ${error.message}`);
      } else if (error.message.includes('memory')) {
        throw new Error(`[ERR_FD_006] Memory error: ${error.message}`);
      } else {
        throw new Error(`[ERR_FD_001] Face detection error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
