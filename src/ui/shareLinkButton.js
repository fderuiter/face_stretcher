import { initSimpleButton } from './simpleButton.js';

export function initShareLinkButton(onShare = () => {}) {
  return initSimpleButton('link-btn', onShare);
}
