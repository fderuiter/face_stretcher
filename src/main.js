import * as THREE from "three";
import { selectFaceRegion } from "./utils/selectFaceRegion.js";
import { showCropper, hideCropper } from "./ui/cropperUI.js";
import {
  createMesh,
  stretchRegion,
  updateSprings,
  resetMesh,
  updateGeometry,
  updateTexture,
  getMeshDimensions,
  getTextureData,
} from "./utils/meshDeformer.js";
import { generateMesh } from "./utils/generateMesh.js";
import { initControls } from "./ui/controlsUI.js";
import { captureCanvas } from "./utils/share.js";
import { initKeyboardControls } from "./ui/keyboardControls.js";
import { initResetButton } from "./ui/resetButton.js";
import { initShareButton } from "./ui/shareButton.js";
import { initShareLinkButton } from "./ui/shareLinkButton.js";
import { generateShareLink, loadSharedImage } from "./utils/shareLink.js";
import { initLoadingIndicator } from "./ui/loadingIndicator.js";
import { initInstructions } from "./ui/instructions.js";

// Error codes:
// ERR_IN_001: Initialization failed
// ERR_IN_002: Three.js setup failed
// ERR_IN_003: Image processing failed
// ERR_IN_004: Canvas capture failed
// ERR_IN_005: Image load failed
// ERR_IN_006: WebGL context lost
// ERR_IN_007: Resource cleanup failed

let renderer, scene, camera, mesh, controls, keyboard;
const kbCursor = new THREE.Vector3();
let orientation = { x: 0, y: 0 };
let lastTime = performance.now();
let isN64Mode = true; // Default to N64 low-poly mode
let currentImage = null; // Store the original full image
let currentBBox = null; // Store the bounding box used

const uploadContainer = document.getElementById("upload-container");
let loadingIndicator;
const resetButton = document.getElementById("reset-btn");
const shareButton = document.getElementById("share-btn");
const linkButton = document.getElementById("link-btn");
let resetControl;
let shareControl;
let linkControl;
let instructionsControl;

// Helper functions for loading state are provided by loadingIndicator

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

async function init(startFile = null) {
  if (loadingIndicator) loadingIndicator.hide();
  uploadContainer.classList.remove("hidden");
  hideResetButton();
  hideShareButton();
  hideLinkButton();
  
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
      bbox.height,
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

    mesh = generateMesh(cropped, isN64Mode);
    scene.add(mesh);

    setupInteraction();
    setupKeyboard();

    if (!controls) {
      controls = initControls({
        onReset: () => resetMesh(),
        onDownload: () => captureCanvas(renderer.domElement),
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
          // No page reload needed now
          // window.location.reload();
        },
        onN64Toggle: (enabled) => {
          isN64Mode = enabled;
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
  } catch (error) {
    console.error("Error creating mesh:", error);
    if (loadingIndicator) loadingIndicator.hide();
    uploadContainer.classList.remove("hidden");
    alert("An error occurred while processing the image. Please try again.");
    return;
  }
}

let isDown = false;
const prevPt = new THREE.Vector3();
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();

function getHit(event) {
  if (!renderer || !camera || !mesh) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  // Use clientX/Y for broader compatibility (touch/mouse)
  const x = event.clientX ?? event.touches[0].clientX;
  const y = event.clientY ?? event.touches[0].clientY;
  ptr.x = ((x - rect.left) / rect.width) * 2 - 1;
  ptr.y = -((y - rect.top) / rect.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObject(mesh);
  return hits[0] ? hits[0].point : null;
}

function handlePointerDown(e) {
  isDown = true;
  const p = getHit(e);
  if (p) prevPt.copy(p);
}

function handlePointerMove(e) {
  if (!isDown) return;
  const p = getHit(e);
  if (p) {
    stretchRegion(prevPt, p);
    prevPt.copy(p);
  }
}

function handlePointerUp() {
  isDown = false;
}

function setupInteraction() {
  if (!renderer) return;
  const domElement = renderer.domElement;
  // Remove previous listeners if any to avoid duplicates
  domElement.removeEventListener("pointerdown", handlePointerDown);
  domElement.removeEventListener("pointermove", handlePointerMove);
  domElement.removeEventListener("pointerup", handlePointerUp);
  domElement.removeEventListener("pointerleave", handlePointerUp); // Handle leaving canvas
  domElement.removeEventListener("touchstart", handlePointerDown);
  domElement.removeEventListener("touchmove", handlePointerMove);
  domElement.removeEventListener("touchend", handlePointerUp);

  // Add new listeners
  domElement.addEventListener("pointerdown", handlePointerDown);
  domElement.addEventListener("pointermove", handlePointerMove);
  domElement.addEventListener("pointerup", handlePointerUp);
  domElement.addEventListener("pointerleave", handlePointerUp);
  domElement.addEventListener("touchstart", handlePointerDown, {
    passive: false,
  }); // passive: false for potential preventDefault
  domElement.addEventListener("touchmove", handlePointerMove, {
    passive: false,
  });
  domElement.addEventListener("touchend", handlePointerUp);
}

function setupKeyboard() {
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
        // Lock simply stops spring updates until released
        orientation.locked = true;
      }
    },
    onLockEnd: () => {
      orientation.locked = false;
      resetMesh();
    },
    onZoom: (level) => {
      if (camera && camera.position) {
        camera.position.z = 5 / level;
      }
    },
    onRotate: (dir) => {
      if (!mesh || !mesh.rotation || typeof mesh.rotation.set !== "function")
        return;
      const step = Math.PI / 16;
      switch (dir) {
        case "left":
          orientation.y += step;
          break;
        case "right":
          orientation.y -= step;
          break;
        case "up":
          orientation.x -= step;
          break;
        case "down":
          orientation.x += step;
          break;
      }
      mesh.rotation.set(orientation.x, orientation.y, 0);
    },
    onExit: () => {
      if (controls) controls.destroy();
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
    },
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
  if (!orientation.locked) {
    updateSprings(Math.min(dt, 0.1)); // Clamp dt to avoid instability
  }
  renderer.render(scene, camera);
  lastTime = now;
  requestAnimationFrame(animate);
}

function setupUploadHandlers() {
  if (loadingIndicator) loadingIndicator.hide();
  uploadContainer.classList.remove("hidden");

  uploadContainer.addEventListener("click", () => init());
  uploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadContainer.classList.add("dragover");
  });
  uploadContainer.addEventListener("dragleave", () => {
    uploadContainer.classList.remove("dragover");
  });
  uploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadContainer.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) init(file);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadingIndicator = initLoadingIndicator();
  setupUploadHandlers();
  const shared = loadSharedImage();
  if (shared) {
    shared.onload = () => {
      proceedWithCroppedImage(shared, { x: 0, y: 0, width: shared.width, height: shared.height });
    };
    return;
  }
  resetControl = initResetButton(() => {
    resetMesh();
  });
  shareControl = initShareButton(() => {
    if (renderer) captureCanvas(renderer.domElement);
  });
  linkControl = initShareLinkButton(() => {
    if (renderer) {
      const link = generateShareLink(renderer.domElement);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => alert("Link copied to clipboard!"), () => window.prompt("Copy this link:", link));
      } else {
        window.prompt("Copy this link:", link);
      }
    }
  });
  instructionsControl = initInstructions();
  hideResetButton();
  hideShareButton();
  hideLinkButton();
  });
  // init(); // Call init directly if script is at the end of body or defer
