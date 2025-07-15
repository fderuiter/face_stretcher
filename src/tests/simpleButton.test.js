import { initSimpleButton } from '../ui/simpleButton.js';

describe('initSimpleButton', () => {
  test('click triggers callback', () => {
    document.body.innerHTML = '<button id="test-btn"></button>';
    const cb = jest.fn();
    const ctrl = initSimpleButton('test-btn', cb);
    document.getElementById('test-btn').click();
    expect(cb).toHaveBeenCalled();
    ctrl.destroy();
  });

  test('handles missing button gracefully', () => {
    const ctrl = initSimpleButton('no-btn', () => {});
    expect(ctrl).toHaveProperty('destroy');
    ctrl.destroy();
  });
});
