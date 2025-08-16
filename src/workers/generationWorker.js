import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

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
    // Backend should be initialized by ensureBackend() before this is called.
    await tf.ready();
    modelPromise = faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      { runtime: 'tfjs' }
    );
  }
  return modelPromise;
}

function __resetModel() {
  modelPromise = null;
}

/**
 * Returns a bbox {x, y, width, height} around the first detected face
 * or rejects if none found.
 */
async function detectFace(imageBitmap) {
  try {
    if (!imageBitmap) {
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
      const predictions = await model.estimateFaces(imageBitmap);
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
      if (error.message.includes('No face detected')) {
        console.warn('No face detected in the image. Falling back to manual cropping.');
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
    // Instead of logging and re-throwing, post an error message back to the main thread
    self.postMessage({ type: 'error', error: error.message });
    throw error; // Still throw to stop execution in the worker
  }
}

import * as THREE from 'three';

// --- Mesh Generation ---

const N64_SEGMENTS = 10;
const HD_SEGMENTS = 100;
const N64_TEXTURE_SIZE = 128;
const HD_TEXTURE_SIZE = 512;

function generateMesh(source, n64Mode = true, curvature = 0) {
  if (!source || !source.width || !source.height) {
    throw new Error('[ERR_MG_001] Invalid source image');
  }

  const targetMax = n64Mode ? N64_TEXTURE_SIZE : HD_TEXTURE_SIZE;
  const aspect = source.width / source.height;
  const canvas = new OffscreenCanvas(1, 1);
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
  const textureBitmap = canvas.transferToImageBitmap();

  const maxDim = Math.max(canvas.width, canvas.height);
  const width = (canvas.width / maxDim) * 2;
  const height = (canvas.height / maxDim) * 2;
  const segments = n64Mode ? N64_SEGMENTS : HD_SEGMENTS;

  return createMeshGeometry(textureBitmap, width, height, segments, n64Mode, curvature);
}


function createMeshGeometry(
  textureBitmap,
  width,
  height,
  segments,
  pixelated = false,
  curvature = 0
) {
  let geo;
  let curv = curvature;
  if (typeof curvature === 'boolean') curv = curvature ? 1 : 0;

  if (curv > 0) {
    const radius = width / 2;
    const thetaLength = Math.PI * curv;
    const thetaStart = (Math.PI - thetaLength) / 2;
    geo = new THREE.SphereGeometry(
      radius,
      segments,
      segments,
      -Math.PI / 2,
      Math.PI,
      thetaStart,
      thetaLength
    );
    const baseHeight = 2 * radius * Math.sin(thetaLength / 2);
    const scaleY = height / baseHeight;
    geo.scale(1, scaleY, 1);
  } else {
    geo = new THREE.PlaneGeometry(width, height, segments, segments);
  }

  const geometryData = {
    positions: geo.attributes.position.array,
    uvs: geo.attributes.uv.array,
    indices: geo.index.array,
  };

  const meshData = {
    geometryData,
    textureBitmap,
    width,
    height,
    segments,
    pixelated,
    curvature: curv,
  };

  return meshData;
}


self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'detectFace') {
    try {
      const bbox = await detectFace(payload.imageBitmap);
      self.postMessage({ type: 'faceDetected', payload: { bbox } });
    } catch (error) {
      // Error is already posted in detectFace
    }
  } else if (type === 'generateMesh') {
    try {
      const { imageBitmap, n64Mode, curvature } = payload;
      const meshData = generateMesh(imageBitmap, n64Mode, curvature);
      self.postMessage({ type: 'meshGenerated', payload: meshData }, [meshData.textureBitmap, meshData.geometryData.positions.buffer, meshData.geometryData.uvs.buffer, meshData.geometryData.indices.buffer]);
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
  else if (type === 'resetModel') {
    __resetModel();
  }
};
