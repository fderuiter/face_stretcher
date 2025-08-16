import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { logError } from './analytics.js';

/**
 * Checks availability of critical back-end components like WebGL and
 * TensorFlow.js. Returns a list of human readable issues or an empty
 * array when everything looks good.
 * @param {Document} doc optional document object for testing
 * @param {*} tfLib optional TensorFlow library for testing
 * @returns {Promise<string[]>}
 */
export async function checkBackendStatus(doc = globalThis.document, tfLib = tf) {
  const issues = [];

  if (doc && doc.createElement) {
    try {
      const canvas = doc.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        issues.push('WebGL not supported or failed to initialize');
      }
    } catch (err) {
      issues.push(`WebGL check failed: ${err.message}`);
    }
  } else {
    issues.push('Document not available');
  }

  try {
    if (tfLib && typeof tfLib.ready === 'function') {
      await tfLib.ready();
      const hasBackend =
        tfLib.findBackend('webgl') || tfLib.findBackend('wasm');
      if (!hasBackend) {
        issues.push('No TensorFlow backend (webgl/wasm) available');
      }
    } else {
      issues.push('TensorFlow library missing');
    }
  } catch (err) {
    issues.push(`TensorFlow init failed: ${err.message}`);
  }

  return issues;
}

/**
 * Ensures the back-end environment is healthy. Logs and throws an error
 * if any issues are detected.
 * @param {Document} doc
 * @param {*} tfLib
 */
export async function assertBackendHealthy(doc, tfLib) {
  const issues = await checkBackendStatus(doc, tfLib);
  if (issues.length) {
    const error = new Error(`[ERR_BC_001] Backend issues: ${issues.join('; ')}`);
    logError(error);
    throw error;
  }
}
