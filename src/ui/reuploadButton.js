import { initSimpleButton } from './simpleButton.js';

export function initReuploadButton(onReupload = () => {}) {
  return initSimpleButton('reupload-btn', onReupload);
}
