import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

let model = null;

/**
 * Returns a bbox {x, y, width, height} around the first detected face
 * or rejects if none found.
 */
export async function detectFace(imageElementOrCanvas) {
  try {
    if (!model) {
      model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
      );
    }
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
    // ERR_FD_001: general face detection failure
    throw new Error(`[ERR_FD_001] Face detection error: ${error.message}`);
  }
}
