import { initInstructions } from '../ui/instructions.js';

describe('instructions overlay', () => {
  let storage;

  beforeEach(() => {
    storage = (() => {
      let store = {};
      return {
        getItem: (k) => store[k],
        setItem: (k, v) => {
          store[k] = v;
        },
        removeItem: (k) => {
          delete store[k];
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
    document.body.innerHTML = `
      <div id="instructions-overlay" class="hidden">
        <button id="close-instructions">Got it</button>
      </div>`;
  });

  test('shows overlay when not previously dismissed', () => {
    initInstructions();
    const overlay = document.getElementById('instructions-overlay');
    expect(overlay.classList.contains('hidden')).toBe(false);
  });

  test('dismiss hides overlay and stores flag', () => {
    const ctrl = initInstructions();
    document.getElementById('close-instructions').click();
    const overlay = document.getElementById('instructions-overlay');
    expect(overlay.classList.contains('hidden')).toBe(true);
    expect(window.localStorage.getItem('instructionsSeen')).toBe('yes');
    ctrl.destroy();
  });
});
