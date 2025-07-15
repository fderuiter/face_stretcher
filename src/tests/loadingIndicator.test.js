import { initLoadingIndicator } from '../ui/loadingIndicator.js';

describe('loading indicator', () => {
  let origDoc;

  beforeEach(() => {
    jest.useFakeTimers();
    origDoc = global.document;
    global.document = window.document;
    document.body.innerHTML = `
      <div id="loading-bar-container" class="hidden">
        <progress id="loading-bar" value="0" max="100"></progress>
        <div id="loading-text"></div>
      </div>`;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.document = origDoc;
  });

  test('show displays progress bar', () => {
    const indicator = initLoadingIndicator();
    indicator.show('Working');
    const container = document.getElementById('loading-bar-container');
    const bar = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    expect(text.textContent).toBe('Working');
    expect(container.classList.contains('hidden')).toBe(false);
    expect(bar.value).toBe(0);
    jest.advanceTimersByTime(600);
    expect(bar.value).toBeGreaterThan(0);
    indicator.destroy();
  });

  test('hide hides progress bar', () => {
    const indicator = initLoadingIndicator();
    indicator.show();
    indicator.hide();
    const container = document.getElementById('loading-bar-container');
    const bar = document.getElementById('loading-bar');
    expect(bar.value).toBe(100);
    jest.advanceTimersByTime(300);
    expect(container.classList.contains('hidden')).toBe(true);
    indicator.destroy();
  });
});
