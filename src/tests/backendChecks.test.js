import { checkBackendStatus, assertBackendHealthy } from '../utils/backendChecks.js';
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

describe('assertBackendHealthy', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('throws with logged error when issues detected', async () => {
    const doc = {
      createElement: () => ({ getContext: () => null })
    };
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(assertBackendHealthy(doc, tf)).rejects.toThrow(/Backend issues/);
    expect(logSpy).toHaveBeenCalled();
  });

  test('resolves when environment ok', async () => {
    const doc = {
      createElement: () => ({ getContext: () => ({}) })
    };
    jest.spyOn(tf, 'findBackend').mockReturnValue('webgl');
    await expect(assertBackendHealthy(doc, tf)).resolves.toBeUndefined();
  });
});

describe('TensorFlow.js Backend Registration', () => {
  test('should have the WebGL backend registered', async () => {
    // This test ensures that the WebGL backend is properly imported and registered.
    // It does not use mocks, so it will fail if the import is removed.
    await tf.ready();
    const backend = tf.getBackend();
    expect(backend).toBe('webgl');
  });
});
