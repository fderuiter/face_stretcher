import * as Sentry from '@sentry/browser';
import { initAnalytics, logError } from '../utils/analytics.js';

describe('analytics', () => {
  let initSpy;
  beforeEach(() => {
    initSpy = jest.spyOn(Sentry, 'init').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.console.error;
  });

  test('initAnalytics does nothing without DSN', () => {
    const original = process.env.VITE_SENTRY_DSN;
    process.env.VITE_SENTRY_DSN = '';
    expect(() => initAnalytics()).not.toThrow();
    expect(initSpy).not.toHaveBeenCalled();
    process.env.VITE_SENTRY_DSN = original;
  });

  test('logError calls console.error', () => {
    const err = new Error('oops');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logError(err);
    expect(consoleSpy).toHaveBeenCalledWith(err);
  });
});
