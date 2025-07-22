export function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) {
    return { destroy() {} };
  }

  const prefersDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const initial = saved ? saved : (prefersDark ? 'dark' : 'light');

  setTheme(initial);
  updateButtonText(initial);

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function updateButtonText(theme) {
    btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updateButtonText(next);
  };

  btn.addEventListener('click', toggle);

  return {
    destroy() {
      btn.removeEventListener('click', toggle);
    }
  };
}
