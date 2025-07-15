import { initUploadArea } from '../ui/uploadArea.js';

describe('upload area UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="upload-container"><input id="upload" type="file"></div>';
  });

  test('drop triggers callback with file', () => {
    const file = new File(['a'], 'test.png', { type: 'image/png' });
    const cb = jest.fn();
    initUploadArea(cb);
    const dropEvent = new Event('drop');
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] } });
    document.getElementById('upload-container').dispatchEvent(dropEvent);
    expect(cb).toHaveBeenCalledWith(file);
  });

  test('change triggers callback with file', () => {
    const file = new File(['b'], 'test.png', { type: 'image/png' });
    const cb = jest.fn();
    initUploadArea(cb);
    const changeEvent = new Event('change');
    Object.defineProperty(changeEvent, 'target', { value: { files: [file] } });
    document.getElementById('upload').dispatchEvent(changeEvent);
    expect(cb).toHaveBeenCalledWith(file);
  });
});
