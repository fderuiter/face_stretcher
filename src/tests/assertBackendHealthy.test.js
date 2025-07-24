import { assertBackendHealthy } from '../utils/backendChecks.js';
import * as analytics from '../utils/analytics.js';

describe('assertBackendHealthy', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('throws and logs when issues detected', async () => {
    jest.spyOn(analytics, 'logError').mockImplementation(() => {});
    const doc = { createElement: () => ({ getContext: () => null }) };
    const tfLib = { ready: jest.fn(() => Promise.resolve()), findBackend: jest.fn(() => null) };
    await expect(assertBackendHealthy(doc, tfLib)).rejects.toThrow('[ERR_BC_001]');
    expect(analytics.logError).toHaveBeenCalled();
  });

  test('resolves when environment ok', async () => {
    jest.spyOn(analytics, 'logError').mockImplementation(() => {});
    const doc = { createElement: () => ({ getContext: () => ({}) }) };
    const tfLib = { ready: jest.fn(() => Promise.resolve()), findBackend: jest.fn(() => 'webgl') };
    await expect(assertBackendHealthy(doc, tfLib)).resolves.toBeUndefined();
    expect(analytics.logError).not.toHaveBeenCalled();
  });
});
