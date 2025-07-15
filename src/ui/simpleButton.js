export function initSimpleButton(id, onClick = () => {}) {
  const btn = document.getElementById(id);
  if (!btn) {
    return { destroy() {} };
  }
  const handler = () => onClick();
  btn.addEventListener('click', handler);
  return {
    destroy() {
      btn.removeEventListener('click', handler);
    },
  };
}
