import GUI from 'dat.gui';

export function initControls({ onReset, onDownload, onParamsChange }) {
  const gui = new GUI({ width: 260 });
  const params = {
    radius: 0.3,
    strength: 1.0,
    stiffness: 8,
    damping: 4,
    reset: () => onReset(),
    download: () => onDownload()
  };

  gui.add(params, 'radius', 0.05, 1.0).onChange(() => onParamsChange(params));
  gui.add(params, 'strength', 0.1, 5.0).onChange(() => onParamsChange(params));
  gui.add(params, 'stiffness', 1, 20).onChange(() => onParamsChange(params));
  gui.add(params, 'damping', 0, 10).onChange(() => onParamsChange(params));
  gui.add(params, 'reset');
  gui.add(params, 'download').name('Save Image');

  return gui;
}
