export function initResetButton(onReset = () => {}) {
  const btn = document.getElementById("reset-btn");
  if (!btn) {
    return { destroy() {} };
  }
  const handler = () => onReset();
  btn.addEventListener("click", handler);
  return {
    destroy() {
      btn.removeEventListener("click", handler);
    },
  };
}
