export function initStatsToggle(stats) {
  const btn = document.getElementById('stats-toggle');
  if (!btn || !stats) {
    return { destroy() {} };
  }

  let visible = false;
  const panel = stats.dom;
  panel.style.position = 'absolute';
  panel.style.top = '0';
  panel.style.left = '0';
  panel.style.zIndex = '60';
  panel.style.display = 'none';

  function update() {
    panel.style.display = visible ? 'block' : 'none';
    const text = visible ? 'Hide Stats' : 'Show Stats';
    btn.textContent = text;
    btn.setAttribute('aria-label', text);
  }

  const toggle = () => {
    visible = !visible;
    update();
  };

  btn.addEventListener('click', toggle);
  document.body.appendChild(panel);
  update();

  return {
    destroy() {
      btn.removeEventListener('click', toggle);
      if (panel.parentNode) panel.parentNode.removeChild(panel);
    },
    show() {
      visible = true;
      update();
    },
    hide() {
      visible = false;
      update();
    },
  };
}
