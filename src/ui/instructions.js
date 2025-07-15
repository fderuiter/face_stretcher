export function initInstructions() {
  const overlay = document.getElementById("instructions-overlay");
  if (!overlay) {
    return { destroy() {}, show() {}, hide() {} };
  }
  const closeBtn = overlay.querySelector("button");
  const key = "instructionsSeen";

  function show() {
    overlay.classList.remove("hidden");
  }

  function hide() {
    overlay.classList.add("hidden");
    try {
      localStorage.setItem(key, "yes");
    } catch (_) {
      // ignore write errors
    }
  }

  function maybeShow() {
    try {
      if (!localStorage.getItem(key)) {
        show();
      }
    } catch (_) {
      // localStorage may be unavailable
      show();
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", hide);
  }

  maybeShow();

  return {
    show,
    hide,
    destroy() {
      if (closeBtn) closeBtn.removeEventListener("click", hide);
    },
  };
}
