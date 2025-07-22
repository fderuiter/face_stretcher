import { initThemeToggle } from '../ui/themeToggle.js';

describe('theme toggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  });

  test('initializes with light theme and toggles to dark', () => {
    document.body.innerHTML = '<button id="theme-toggle"></button>';
    const ctrl = initThemeToggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    document.getElementById('theme-toggle').click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    ctrl.destroy();
  });

  test('respects saved theme', () => {
    localStorage.setItem('theme', 'dark');
    document.body.innerHTML = '<button id="theme-toggle"></button>';
    const ctrl = initThemeToggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    ctrl.destroy();
  });
});
