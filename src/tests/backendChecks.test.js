import { checkBackendStatus } from '../utils/backendChecks.js';
import * as tf from '@tensorflow/tfjs-core';

describe('checkBackendStatus', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('reports missing WebGL context', async () => {
    const doc = {
      createElement: () => ({ getContext: () => null })
    };
    const issues = await checkBackendStatus(doc, tf);
    expect(issues).toContain('WebGL not supported or failed to initialize');
  });

  test('reports missing TensorFlow backend', async () => {
    const doc = {
      createElement: () => ({ getContext: () => ({}) })
    };
    jest.spyOn(tf, 'findBackend').mockReturnValue(null);
    const issues = await checkBackendStatus(doc, tf);
    expect(issues.join(' ')).toMatch(/TensorFlow/);
  });

  test('returns empty array when environment ok', async () => {
    const doc = {
      createElement: () => ({ getContext: () => ({}) })
    };
    jest.spyOn(tf, 'findBackend').mockReturnValue('webgl');
    const issues = await checkBackendStatus(doc, tf);
    expect(issues).toEqual([]);
  });
});
