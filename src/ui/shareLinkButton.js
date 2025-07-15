export function initShareLinkButton(onShare = () => {}) {
  const btn = document.getElementById('link-btn');
  if (!btn) {
    return { destroy() {} };
  }
  const handler = () => onShare();
  btn.addEventListener('click', handler);
  return {
    destroy() {
      btn.removeEventListener('click', handler);
    },
  };
}
