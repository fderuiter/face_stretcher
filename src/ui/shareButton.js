import { initSimpleButton } from './simpleButton.js';

export function initShareButton(onShare = () => {}) {
  return initSimpleButton('share-btn', onShare);
}
