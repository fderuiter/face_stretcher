import { initShareLinkButton } from '../ui/shareLinkButton.js';

describe('share link button UI', () => {
  test('click triggers callback', () => {
    document.body.innerHTML = '<button id="link-btn"></button>';
    const cb = jest.fn();
    const ctrl = initShareLinkButton(cb);
    document.getElementById('link-btn').click();
    expect(cb).toHaveBeenCalled();
    ctrl.destroy();
  });
});
