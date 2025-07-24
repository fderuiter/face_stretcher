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

  const radiusCtrl = gui
    .add(params, "radius", 0.05, 1.0)
    .onChange(() => onParamsChange(params))
    .name("Brush Radius");
  radiusCtrl.domElement.parentElement.parentElement.title =
    "Size of the area affected by dragging";
  if (radiusCtrl.__input) {
    radiusCtrl.__input.setAttribute("aria-label", "Brush Radius");
  }

  const strengthCtrl = gui
    .add(params, "strength", 0.1, 5.0)
    .onChange(() => onParamsChange(params))
    .name("Brush Strength");
  strengthCtrl.domElement.parentElement.parentElement.title =
    "How much the mesh moves when dragged";
  if (strengthCtrl.__input) {
    strengthCtrl.__input.setAttribute("aria-label", "Brush Strength");
  }

  const stiffnessCtrl = gui
    .add(params, "stiffness", 1, 20)
    .onChange(() => onParamsChange(params))
    .name("Spring Stiffness");
  stiffnessCtrl.domElement.parentElement.parentElement.title =
    "How quickly the mesh snaps back";
  if (stiffnessCtrl.__input) {
    stiffnessCtrl.__input.setAttribute("aria-label", "Spring Stiffness");
  }

  const dampingCtrl = gui
    .add(params, "damping", 0, 10)
    .onChange(() => onParamsChange(params))
    .name("Spring Damping");
  dampingCtrl.domElement.parentElement.parentElement.title =
    "How much the spring effect wobbles";
  if (dampingCtrl.__input) {
    dampingCtrl.__input.setAttribute("aria-label", "Spring Damping");
  }

  const n64Ctrl = gui
    .add(params, "n64Mode")
    .onChange((value) => onN64Toggle(value))
    .name("N64 Mode");
  n64Ctrl.domElement.parentElement.parentElement.title =
    "Toggle low-poly mesh and pixelated texture"; // Added N64 toggle
  if (n64Ctrl.__checkbox) {
    n64Ctrl.__checkbox.setAttribute("aria-label", "N64 Mode");
  }

  const curvatureCtrl = gui
    .add(params, "curvature", 0, 1, 0.05)
    .onChange((value) => onCurvatureChange(value))
    .name("Curvature");
  curvatureCtrl.domElement.parentElement.parentElement.title =
    "0 = flat, 1 = hemisphere";
  if (curvatureCtrl.__input) {
    curvatureCtrl.__input.setAttribute("aria-label", "Curvature");
  }

  const resetCtrl = gui.add(params, "reset").name("Reset Mesh");
  resetCtrl.domElement.parentElement.parentElement.title =
    "Snap the mesh back to its original state";
  if (resetCtrl.__button) {
    resetCtrl.__button.setAttribute("aria-label", "Reset Mesh");
  }

  const downloadCtrl = gui.add(params, "download").name("Save Image");
  downloadCtrl.domElement.parentElement.parentElement.title =
    "Download the current view as a PNG image";
  if (downloadCtrl.__button) {
    downloadCtrl.__button.setAttribute("aria-label", "Save Image");
  }

  const newImageCtrl = gui.add(params, "newImage").name("New Image");
  newImageCtrl.domElement.parentElement.parentElement.title =
    "Start over with a new image"; // Added New Image button
  if (newImageCtrl.__button) {
    newImageCtrl.__button.setAttribute("aria-label", "New Image");
  }

  // Store initial params for N64 toggle reference
  gui.userData = { initialParams: { ...params } };

  return gui;
}
