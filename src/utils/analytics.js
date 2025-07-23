import * as Sentry from '@sentry/browser';

let sentryEnabled = false;

export function initAnalytics() {
  const dsn = (typeof process !== 'undefined' && process.env && process.env.VITE_SENTRY_DSN) || (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.VITE_SENTRY_DSN);
  if (dsn) {
    Sentry.init({ dsn });
    sentryEnabled = true;
  }
}

export function logError(error) {
  console.error(error);
  if (sentryEnabled) {
    Sentry.captureException(error);
  }
}

export function installGlobalErrorHandlers() {
  window.addEventListener('error', (e) => logError(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => logError(e.reason));
}
