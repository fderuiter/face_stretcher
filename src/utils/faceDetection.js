import * as facemesh from '@tensorflow-models/facemesh';
import '@tensorflow/tfjs-backend-webgl';

let model = null;

/**
 * Returns a bbox {x,y,width,height} around the first detected face
 * or rejects if none found.
 */
export async function detectFace(imageElementOrCanvas) {
  if (!model) model = await facemesh.load();
  const predictions = await model.estimateFaces(imageElementOrCanvas);
  if (!predictions.length) {
    throw new Error('No face detected');
  }
  const { topLeft, bottomRight } = predictions[0];
  const [x1, y1] = topLeft;
  const [x2, y2] = bottomRight;
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}
