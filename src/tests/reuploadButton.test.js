import { initReuploadButton } from '../ui/reuploadButton.js';

describe('reupload button UI', () => {
  test('click triggers callback', () => {
    document.body.innerHTML = '<button id="reupload-btn"></button>';
    const cb = jest.fn();
    const ctrl = initReuploadButton(cb);
    document.getElementById('reupload-btn').click();
    expect(cb).toHaveBeenCalled();
    ctrl.destroy();
  });
});
