export function initShareButton(onShare = () => {}) {
  const btn = document.getElementById("share-btn");
  if (!btn) {
    return { destroy() {} };
  }
  const handler = () => onShare();
  btn.addEventListener("click", handler);
  return {
    destroy() {
      btn.removeEventListener("click", handler);
    },
  };
}
