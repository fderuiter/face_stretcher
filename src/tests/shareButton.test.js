import { initShareButton } from '../ui/shareButton.js';

describe('share button UI', () => {
  test('click triggers callback', () => {
    document.body.innerHTML = '<button id="share-btn"></button>';
    const cb = jest.fn();
    const ctrl = initShareButton(cb);
    document.getElementById('share-btn').click();
    expect(cb).toHaveBeenCalled();
    ctrl.destroy();
  });
});
