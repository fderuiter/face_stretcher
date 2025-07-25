export function initStatsToggle(stats) {
  const btn = document.getElementById('stats-toggle');
  if (!btn || !stats) {
    return { destroy() {} };
  }

  let visible = true;

  const update = () => {
    const text = visible ? 'Hide Stats' : 'Show Stats';
    btn.textContent = text;
    btn.setAttribute('aria-label', text);
  };

  const toggle = () => {
    visible = !visible;
    stats.dom.style.display = visible ? 'block' : 'none';
    update();
  };

  btn.addEventListener('click', toggle);
  update();

  return {
    destroy() {
      btn.removeEventListener('click', toggle);
    }
  };
}
