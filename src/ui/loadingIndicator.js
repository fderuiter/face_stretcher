export function initLoadingIndicator() {
  const container = document.getElementById('loading-bar-container');
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  let interval;

  function show(message = 'Loading...') {
    if (!container || !bar || !text) return;
    text.textContent = message;
    container.classList.remove('hidden');
    bar.value = 0;
    clearInterval(interval);
    interval = setInterval(() => {
      if (bar.value < 90) bar.value += 10;
    }, 300);
  }

  function hide() {
    if (!container || !bar) return;
    clearInterval(interval);
    bar.value = 100;
    setTimeout(() => container.classList.add('hidden'), 300);
  }

  function destroy() {
    clearInterval(interval);
  }

  return { show, hide, destroy };
}
