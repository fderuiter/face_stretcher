export function initLoadingIndicator() {
  const container = document.getElementById('loading-bar-container');
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  let progressInterval;
  let hideTimeout;

  function show(message = 'Loading...') {
    if (!container || !bar || !text) return;
    clearTimeout(hideTimeout);
    clearInterval(progressInterval);
    text.textContent = message;
    bar.classList.remove('error');
    container.classList.remove('hidden');
    bar.value = 0;
    progressInterval = setInterval(() => {
      if (bar.value < 90) bar.value += 10;
    }, 300);
  }

  function hide() {
    if (!container || !bar) return;
    clearTimeout(hideTimeout);
    clearInterval(progressInterval);
    bar.value = 100;
    hideTimeout = setTimeout(() => container.classList.add('hidden'), 300);
  }

  function showError(message) {
    if (!container || !bar || !text) return;
    clearTimeout(hideTimeout);
    clearInterval(progressInterval);
    text.textContent = message;
    bar.value = 100;
    bar.classList.add('error');
    container.classList.remove('hidden');
    hideTimeout = setTimeout(() => container.classList.add('hidden'), 5000);
  }

  function destroy() {
    clearTimeout(hideTimeout);
    clearInterval(progressInterval);
  }

  return { show, hide, showError, destroy };
}
