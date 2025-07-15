import { initSimpleButton } from './simpleButton.js';

export function initResetButton(onReset = () => {}) {
  return initSimpleButton('reset-btn', onReset);
}
