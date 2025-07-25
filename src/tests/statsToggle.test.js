import { initStatsToggle } from '../ui/statsToggle.js';

describe('stats toggle', () => {
  test('toggles panel visibility', () => {
    document.body.innerHTML = '<button id="stats-toggle"></button>';
    const fakeStats = { dom: document.createElement('div') };
    const ctrl = initStatsToggle(fakeStats);
    const btn = document.getElementById('stats-toggle');
    expect(fakeStats.dom.style.display).toBe('none');
    btn.click();
    expect(fakeStats.dom.style.display).toBe('block');
    expect(btn.textContent).toBe('Hide Stats');
    btn.click();
    expect(fakeStats.dom.style.display).toBe('none');
    ctrl.destroy();
  });
});
