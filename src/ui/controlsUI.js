import { GUI } from "dat.gui";

export function initControls({
  onReset,
  onDownload,
  onParamsChange,
  onNewImage,
  onN64Toggle,
  onCurvatureChange,
}) {
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
    newImage: () => onNewImage(), // Added New Image action
  };

  const setAriaLabel = (ctrl, label) => {
    const el = ctrl.domElement.querySelector("input, button");
    if (el) {
      el.setAttribute("aria-label", label);
    }
  };

  const radiusCtrl = gui
    .add(params, "radius", 0.05, 1.0)
    .onChange(() => onParamsChange(params))
    .name("Brush Radius");
  radiusCtrl.domElement.parentElement.parentElement.title =
    "Size of the area affected by dragging";
  setAriaLabel(radiusCtrl, "Brush Radius");

  const strengthCtrl = gui
    .add(params, "strength", 0.1, 5.0)
    .onChange(() => onParamsChange(params))
    .name("Brush Strength");
  strengthCtrl.domElement.parentElement.parentElement.title =
    "How much the mesh moves when dragged";
  setAriaLabel(strengthCtrl, "Brush Strength");

  const stiffnessCtrl = gui
    .add(params, "stiffness", 1, 20)
    .onChange(() => onParamsChange(params))
    .name("Spring Stiffness");
  stiffnessCtrl.domElement.parentElement.parentElement.title =
    "How quickly the mesh snaps back";
  setAriaLabel(stiffnessCtrl, "Spring Stiffness");

  const dampingCtrl = gui
    .add(params, "damping", 0, 10)
    .onChange(() => onParamsChange(params))
    .name("Spring Damping");
  dampingCtrl.domElement.parentElement.parentElement.title =
    "How much the spring effect wobbles";
  setAriaLabel(dampingCtrl, "Spring Damping");

  const n64Ctrl = gui
    .add(params, "n64Mode")
    .onChange((value) => onN64Toggle(value))
    .name("N64 Mode");
  n64Ctrl.domElement.parentElement.parentElement.title =
    "Toggle low-poly mesh and pixelated texture"; // Added N64 toggle
  setAriaLabel(n64Ctrl, "N64 Mode");

  const curvatureCtrl = gui
    .add(params, "curvature", 0, 1, 0.05)
    .onChange((value) => onCurvatureChange(value))
    .name("Curvature");
  curvatureCtrl.domElement.parentElement.parentElement.title =
    "0 = flat, 1 = hemisphere";
  setAriaLabel(curvatureCtrl, "Curvature");

  const resetCtrl = gui.add(params, "reset").name("Reset Mesh");
  resetCtrl.domElement.parentElement.parentElement.title =
    "Snap the mesh back to its original state";
  setAriaLabel(resetCtrl, "Reset Mesh");

  const downloadCtrl = gui.add(params, "download").name("Save Image");
  downloadCtrl.domElement.parentElement.parentElement.title =
    "Download the current view as a PNG image";
  setAriaLabel(downloadCtrl, "Save Image");

  const newImageCtrl = gui.add(params, "newImage").name("New Image");
  newImageCtrl.domElement.parentElement.parentElement.title =
    "Start over with a new image"; // Added New Image button
  setAriaLabel(newImageCtrl, "New Image");

  // Store initial params for N64 toggle reference
  gui.userData = { initialParams: { ...params } };

  return gui;
}
