import { initStatsToggle } from '../ui/statsToggle.js';

describe('stats toggle UI', () => {
  test('click toggles stats visibility', () => {
    document.body.innerHTML = '<button id="stats-toggle"></button>';
    const stats = { dom: document.createElement('div') };
    document.body.appendChild(stats.dom);
    const ctrl = initStatsToggle(stats);
    const btn = document.getElementById('stats-toggle');

    expect(stats.dom.style.display).toBe('');
    expect(btn.textContent).toMatch(/Hide/);

    btn.click();
    expect(stats.dom.style.display).toBe('none');
    expect(btn.textContent).toMatch(/Show/);

    btn.click();
    expect(stats.dom.style.display).toBe('block');
    expect(btn.textContent).toMatch(/Hide/);

    ctrl.destroy();
  });

  test('handles missing button gracefully', () => {
    const stats = { dom: document.createElement('div') };
    const ctrl = initStatsToggle(stats);
    expect(ctrl).toHaveProperty('destroy');
    ctrl.destroy();
  });
});
