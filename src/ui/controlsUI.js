import GUI from 'dat.gui';

export function initControls({ onReset, onDownload, onParamsChange, onNewImage, onN64Toggle, onCurvatureChange }) {
  const gui = new GUI({ width: 260 });
  const params = {
    radius: 0.3,
    strength: 1.0,
    stiffness: 8,
    damping: 4,
    n64Mode: true, // Default N64 mode enabled
    curvature: 0,
    reset: () => onReset(),
    download: () => onDownload(),
    newImage: () => onNewImage() // Added New Image action
  };

  gui.add(params, 'radius', 0.05, 1.0).onChange(() => onParamsChange(params)).name('Brush Radius').domElement.parentElement.parentElement.title = "Size of the area affected by dragging";
  gui.add(params, 'strength', 0.1, 5.0).onChange(() => onParamsChange(params)).name('Brush Strength').domElement.parentElement.parentElement.title = "How much the mesh moves when dragged";
  gui.add(params, 'stiffness', 1, 20).onChange(() => onParamsChange(params)).name('Spring Stiffness').domElement.parentElement.parentElement.title = "How quickly the mesh snaps back";
  gui.add(params, 'damping', 0, 10).onChange(() => onParamsChange(params)).name('Spring Damping').domElement.parentElement.parentElement.title = "How much the spring effect wobbles";
  gui.add(params, 'n64Mode').onChange((value) => onN64Toggle(value)).name('N64 Mode').domElement.parentElement.parentElement.title = "Toggle low-poly mesh and pixelated texture"; // Added N64 toggle
  gui.add(params, 'curvature', 0, 1, 0.05).onChange((value) => onCurvatureChange(value)).name('Curvature').domElement.parentElement.parentElement.title = "0 = flat, 1 = hemisphere";
  gui.add(params, 'reset').name('Reset Mesh').domElement.parentElement.parentElement.title = "Snap the mesh back to its original state";
  gui.add(params, 'download').name('Save Image').domElement.parentElement.parentElement.title = "Download the current view as a PNG image";
  gui.add(params, 'newImage').name('New Image').domElement.parentElement.parentElement.title = "Start over with a new image"; // Added New Image button

  // Store initial params for N64 toggle reference
  gui.userData = { initialParams: { ...params } };

  return gui;
}
