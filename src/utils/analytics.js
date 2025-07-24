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
  if (typeof document !== 'undefined') {
    let overlay = document.getElementById('error-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'error-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '1.1rem',
        wordBreak: 'break-word',
      });
      document.body.appendChild(overlay);
    }
    overlay.textContent = error && error.message ? error.message : String(error);
  }
}

export function installGlobalErrorHandlers() {
  window.addEventListener('error', (e) => logError(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => logError(e.reason));
}
