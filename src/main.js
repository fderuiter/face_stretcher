import * as THREE from "three";
import { selectFaceRegion } from "./utils/selectFaceRegion.js";
import { showCropper, hideCropper } from "./ui/cropperUI.js";
import { initUploadArea } from "./ui/uploadArea.js";
import {
  createMesh,
  stretchRegion,
  updateSprings,
  resetMesh,
  updateGeometry,
  updateTexture,
  getMeshDimensions,
  getTextureData,
  lockCurrentDeformation,
  unlockDeformation,
} from "./utils/meshDeformer.js";
import { generateMesh } from "./utils/generateMesh.js";
import { initControls } from "./ui/controlsUI.js";
import { captureCanvas } from "./utils/share.js";
import { initKeyboardControls } from "./ui/keyboardControls.js";
import { initResetButton } from "./ui/resetButton.js";
import { initShareButton } from "./ui/shareButton.js";
import { initShareLinkButton } from "./ui/shareLinkButton.js";
import { initReuploadButton } from "./ui/reuploadButton.js";
import { generateShareLink, loadSharedImage } from "./utils/shareLink.js";
import { initLoadingIndicator } from "./ui/loadingIndicator.js";
import { initInstructions } from "./ui/instructions.js";
import { initThemeToggle } from "./ui/themeToggle.js";
import { createDefaultGrabPoints } from "./utils/grabPoints.js";
import { initPointerControls } from "./ui/pointerControls.js";
import { createCameraController } from "./utils/cameraController.js";
import { initGrabIndicators } from "./ui/grabIndicators.js";

// Error codes:
// ERR_IN_001: Initialization failed
// ERR_IN_002: Three.js setup failed
// ERR_IN_003: Image processing failed
// ERR_IN_004: Canvas capture failed
// ERR_IN_005: Image load failed
// ERR_IN_006: WebGL context lost
// ERR_IN_007: Resource cleanup failed

let renderer,
  scene,
  camera,
  mesh,
  controls,
  keyboard,
  pointerControl,
  cameraCtrl;
const prevPt = new THREE.Vector3();
const kbCursor = new THREE.Vector3();
let lastTime = performance.now();
let isN64Mode = true; // Default to N64 low-poly mode
let meshCurvature = 0;
let currentImage = null; // Store the original full image
let currentBBox = null; // Store the bounding box used
let indicatorControl;

const uploadContainer = document.getElementById("upload-container");
let loadingIndicator;
const resetButton = document.getElementById("reset-btn");
const shareButton = document.getElementById("share-btn");
const linkButton = document.getElementById("link-btn");
const reuploadButton = document.getElementById("reupload-btn");
let resetControl;
let shareControl;
let linkControl;
let reuploadControl;
let instructionsControl;
let uploadControl;
let themeControl;

// Helper functions for loading state are provided by loadingIndicator

function setupRenderer() {
  const canvas = document.getElementById("c");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 5;
  window.addEventListener("resize", onWindowResize);
}

function showResetButton() {
  if (resetButton) resetButton.classList.remove("hidden");
}

function hideResetButton() {
  if (resetButton) resetButton.classList.add("hidden");
}

function showShareButton() {
  if (shareButton) shareButton.classList.remove("hidden");
}

function hideShareButton() {
  if (shareButton) shareButton.classList.add("hidden");
}

function showLinkButton() {
  if (linkButton) linkButton.classList.remove("hidden");
}

function hideLinkButton() {
  if (linkButton) linkButton.classList.add("hidden");
}

function showReuploadButton() {
  if (reuploadButton) reuploadButton.classList.remove("hidden");
}

function hideReuploadButton() {
  if (reuploadButton) reuploadButton.classList.add("hidden");
}

async function init(startFile = null) {
  if (loadingIndicator) loadingIndicator.hide();
  uploadContainer.classList.remove("hidden");
  hideResetButton();
  hideShareButton();
  hideLinkButton();
  hideReuploadButton();
  if (indicatorControl) {
    indicatorControl.destroy();
    indicatorControl = null;
  }

  let img;
  try {
    img = await showCropper(false, startFile);
    if (!img) {
      console.log("No image selected.");
      uploadContainer.classList.remove("hidden");
      return;
    }
    currentImage = img;
    hideCropper();
    uploadContainer.classList.add("hidden");
  } catch (error) {
    console.error("Error during initial image selection:", error);
    if (loadingIndicator) loadingIndicator.hide();
    uploadContainer.classList.remove("hidden");
    alert("Error loading image. Please try a different file.");
    return;
  }

  if (loadingIndicator) loadingIndicator.show("Detecting face...");

  try {
    const { image: faceImg, bbox } = await selectFaceRegion(img, startFile);
    currentImage = faceImg;
    currentBBox = bbox;
    hideCropper();
    proceedWithCroppedImage(currentImage, currentBBox);
  } catch (error) {
    console.error("Error during face selection:", error);
    if (loadingIndicator) loadingIndicator.hide();
    uploadContainer.classList.remove("hidden");
    alert("An error occurred while processing the image. Please try again.");
  }
}

function proceedWithCroppedImage(img, bbox) {
  if (loadingIndicator) loadingIndicator.show("Creating mesh...");

  try {
    const cropped = document.createElement("canvas");
    cropped.width = bbox.width;
    cropped.height = bbox.height;
    const ctx = cropped.getContext("2d");
    if (!ctx) {
      throw new Error("[ERR_IN_003] Could not get 2D context");
    }

    ctx.drawImage(
      img,
      bbox.x,
      bbox.y,
      bbox.width,
      bbox.height,
      0,
      0,
      bbox.width,
      bbox.height
    );

    if (!renderer) {
      try {
        setupRenderer();
      } catch (error) {
        throw new Error(`[ERR_IN_002] ${error.message}`);
      }
    }

    if (mesh) {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      }
    }

    mesh = generateMesh(cropped, isN64Mode, meshCurvature);
    scene.add(mesh);
    cameraCtrl = createCameraController({ camera, mesh });

    if (pointerControl) pointerControl.destroy();
    const dims = getMeshDimensions();
    const grabPoints = createDefaultGrabPoints(dims.width, dims.height);
    pointerControl = initPointerControls({
      renderer,
      camera,
      mesh,
      onDrag: stretchRegion,
      grabPoints,
    });
    if (indicatorControl) indicatorControl.destroy();
    indicatorControl = initGrabIndicators({
      points: grabPoints,
      width: dims.width,
      height: dims.height,
    });
    setupKeyboard(grabPoints);

    if (!controls) {
      controls = initControls({
        onReset: () => resetMesh(),
        onDownload: () =>
          captureCanvas(renderer.domElement).catch((err) => console.error(err)),
        onParamsChange: (params) => {
          if (mesh) {
            mesh.userData.radius = params.radius;
            mesh.userData.strength = params.strength;
            mesh.userData.kStiff = params.stiffness;
            mesh.userData.damping = params.damping;
          }
        },
        onNewImage: () => {
          // Clean up Three.js resources
          if (mesh) {
            scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
              if (mesh.material.map) mesh.material.map.dispose();
              mesh.material.dispose();
            }
          }
          if (controls) controls.destroy();
          if (pointerControl) {
            pointerControl.destroy();
            pointerControl = null;
          }
          if (indicatorControl) {
            indicatorControl.destroy();
            indicatorControl = null;
          }
          controls = null;
          if (keyboard) {
            keyboard.destroy();
            keyboard = null;
          }
          mesh = null;
          currentImage = null;
          currentBBox = null;
          // Stop animation loop
          lastTime = 0;
          // Show upload container again
          uploadContainer.classList.remove("hidden");
          if (loadingIndicator) loadingIndicator.hide(); // Ensure loading is hidden
          hideResetButton();
          hideShareButton();
          hideLinkButton();
          hideReuploadButton();
          // No page reload needed now
          // window.location.reload();
        },
        onN64Toggle: (enabled) => {
          isN64Mode = enabled;
          if (currentImage && currentBBox) {
            proceedWithCroppedImage(currentImage, currentBBox);
          }
        },
        onCurvatureChange: (value) => {
          meshCurvature = value;
          if (currentImage && currentBBox) {
            proceedWithCroppedImage(currentImage, currentBBox);
          }
        },
      });
    }

    // Start animation loop or reset time
    if (lastTime === 0) {
      lastTime = performance.now();
      requestAnimationFrame(animate);
    } else {
      lastTime = performance.now();
    }

    if (loadingIndicator) loadingIndicator.hide(); // Hide loading ONLY after everything is set up
    showResetButton();
    showShareButton();
    showLinkButton();
    showReuploadButton();
  } catch (error) {
    console.error("Error creating mesh:", error);
    if (loadingIndicator) loadingIndicator.hide();
    uploadContainer.classList.remove("hidden");
    alert("An error occurred while processing the image. Please try again.");
    return;
  }
}

function setupKeyboard(grabPoints) {
  if (keyboard) keyboard.destroy();
  keyboard = initKeyboardControls({
    onMove: (pos) => {
      kbCursor.set(pos.x, pos.y, 0);
    },
    onGrabStart: () => {
      prevPt.copy(kbCursor);
    },
    onGrabMove: () => {
      stretchRegion(prevPt, kbCursor);
      prevPt.copy(kbCursor);
    },
    onGrabEnd: (locked) => {
      if (locked) {
        lockCurrentDeformation();
      }
    },
    onLockEnd: () => {
      unlockDeformation();
    },
    onZoom: (level) => {
      if (cameraCtrl) cameraCtrl.zoom(level);
    },
    onRotate: (dir) => {
      if (cameraCtrl) cameraCtrl.rotate(dir);
    },
    onExit: () => {
      if (controls) controls.destroy();
      if (pointerControl) {
        pointerControl.destroy();
        pointerControl = null;
      }
      if (indicatorControl) {
        indicatorControl.destroy();
        indicatorControl = null;
      }
      controls = null;
      if (keyboard) {
        keyboard.destroy();
        keyboard = null;
      }
      resetMesh();
      uploadContainer.classList.remove("hidden");
      hideResetButton();
      hideShareButton();
      hideLinkButton();
      hideReuploadButton();
    },
    grabPoints,
  });
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function animate(now) {
  if (!mesh) {
    // Stop loop if mesh is removed (e.g., New Image)
    lastTime = 0; // Reset time to indicate loop stopped
    return;
  }
  const dt = (now - lastTime) / 1000;
  updateSprings(Math.min(dt, 0.1)); // Clamp dt to avoid instability
  if (indicatorControl) indicatorControl.update();
  renderer.render(scene, camera);
  lastTime = now;
  requestAnimationFrame(animate);
}

document.addEventListener("DOMContentLoaded", () => {
  loadingIndicator = initLoadingIndicator();
  uploadControl = initUploadArea((file) => init(file));
  const shared = loadSharedImage();
  if (shared) {
    shared.onload = () => {
      proceedWithCroppedImage(shared, {
        x: 0,
        y: 0,
        width: shared.width,
        height: shared.height,
      });
    };
    return;
  }
  resetControl = initResetButton(() => {
    resetMesh();
  });
  shareControl = initShareButton(() => {
    if (renderer)
      captureCanvas(renderer.domElement).catch((err) => console.error(err));
  });
  linkControl = initShareLinkButton(() => {
    if (renderer) {
      const link = generateShareLink(renderer.domElement);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(
          () => alert("Link copied to clipboard!"),
          () => window.prompt("Copy this link:", link)
        );
      } else {
        window.prompt("Copy this link:", link);
      }
    }
  });
  reuploadControl = initReuploadButton(() => {
    if (controls) controls.destroy();
    if (pointerControl) {
      pointerControl.destroy();
      pointerControl = null;
    }
    if (indicatorControl) {
      indicatorControl.destroy();
      indicatorControl = null;
    }
    controls = null;
    if (keyboard) {
      keyboard.destroy();
      keyboard = null;
    }
    if (mesh) {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      }
    }
    mesh = null;
    currentImage = null;
    currentBBox = null;
    lastTime = 0;
    uploadContainer.classList.remove("hidden");
    if (loadingIndicator) loadingIndicator.hide();
    hideResetButton();
    hideShareButton();
    hideLinkButton();
    hideReuploadButton();
  });
  instructionsControl = initInstructions();
  themeControl = initThemeToggle();
  hideResetButton();
  hideShareButton();
  hideLinkButton();
  hideReuploadButton();
});
// init(); // Call init directly if script is at the end of body or defer
