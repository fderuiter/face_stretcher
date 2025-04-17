import * as THREE from 'three';
import { detectFace } from './utils/faceDetection.js';
import { showCropper, hideCropper } from './ui/cropperUI.js';
import {
  createMesh,
  stretchRegion,
  updateSprings,
  resetMesh,
  updateGeometry,
  updateTexture,
  getMeshDimensions,
  getTextureData
} from './utils/meshDeformer.js';
import { initControls } from './ui/controlsUI.js';
import { captureCanvas } from './utils/share.js';

// Error codes:
// ERR_IN_001: Initialization failed
// ERR_IN_002: Three.js setup failed
// ERR_IN_003: Image processing failed
// ERR_IN_004: Canvas capture failed
// ERR_IN_005: Image load failed
// ERR_IN_006: WebGL context lost
// ERR_IN_007: Resource cleanup failed

let renderer, scene, camera, mesh, controls;
let lastTime = performance.now();
let isN64Mode = true; // Default to N64 low-poly mode
const N64_SEGMENTS = 10; // Low resolution for N64 mode
const HD_SEGMENTS = 100; // High resolution for HD mode
let currentImage = null; // Store the original full image
let currentBBox = null; // Store the bounding box used

const uploadContainer = document.getElementById('upload-container');
const loadingContainer = document.getElementById('loading-bar-container');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');
let loadingInterval;

// Helper functions for loading state
function showLoading(text = "Loading...") {
    loadingText.textContent = text;
    loadingContainer.classList.remove('hidden');
    loadingBar.value = 0;
    console.log(`Showing loading: ${text}`);
    clearInterval(loadingInterval);
    loadingInterval = setInterval(() => {
      if (loadingBar.value < 90) loadingBar.value += 10;
    }, 300);
}

function hideLoading() {
    clearInterval(loadingInterval);
    loadingBar.value = 100;
    console.log("Hiding loading");
    setTimeout(() => loadingContainer.classList.add('hidden'), 300);
}

async function init() {
  hideLoading();
  uploadContainer.classList.remove('hidden');

  let img;
  try {
    img = await showCropper();
    if (!img) {
        console.log("No image selected.");
        uploadContainer.classList.remove('hidden');
        return;
    }
    currentImage = img;
    hideCropper();
    uploadContainer.classList.add('hidden');
  } catch (error) {
    console.error("Error during initial image selection:", error);
    hideLoading();
    uploadContainer.classList.remove('hidden');
    alert("Error loading image. Please try a different file.");
    return;
  }

  showLoading("Detecting face...");

  let bbox;
  let detectionFailed = false;
  try {
    bbox = await detectFace(img);
    currentBBox = bbox;
  } catch (error) {
    console.warn("Face detection failed:", error);
    detectionFailed = true;
  }

  if (detectionFailed) {
    hideLoading();
    try {
        const manualImgData = await showCropper(true);
        if (!manualImgData) {
            console.log("Manual cropping cancelled.");
            hideLoading();
            uploadContainer.classList.remove('hidden');
            return;
        }
        hideCropper();
        uploadContainer.classList.add('hidden');
        currentImage = manualImgData.imageElement;
        currentBBox = manualImgData.cropData;
        proceedWithCroppedImage(currentImage, currentBBox);
    } catch (error) {
        console.error("Error during manual cropping:", error);
        hideLoading();
        uploadContainer.classList.remove('hidden');
        alert("An error occurred while processing the image. Please try again.");
    }
    return;
  }

  proceedWithCroppedImage(img, bbox);
}

function proceedWithCroppedImage(img, bbox) {
  showLoading("Creating mesh...");

  try {
    const cropped = document.createElement('canvas');
    cropped.width = bbox.width;
    cropped.height = bbox.height;
    const ctx = cropped.getContext('2d');
    if (!ctx) {
      throw new Error('[ERR_IN_003] Could not get 2D context');
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

    const canvasTexture = new THREE.CanvasTexture(cropped);

    if (!renderer) {
      try {
        setupRenderer();
      } catch (error) {
        throw new Error(`[ERR_IN_002] ${error.message}`);
      }
    }

    const segments = isN64Mode ? N64_SEGMENTS : HD_SEGMENTS;
    const meshWidth = 2;
    const meshHeight = 2 * (bbox.height / bbox.width);

    if (mesh) {
      scene.remove(mesh);
      // Consider disposing geometry/material if needed
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
          if (mesh.material.map) mesh.material.map.dispose();
          mesh.material.dispose();
      }
    }

    mesh = createMesh(
      canvasTexture,
      meshWidth,
      meshHeight,
      segments,
      isN64Mode
    );
    scene.add(mesh);

    setupInteraction();

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
           mesh = null;
           currentImage = null;
           currentBBox = null;
           // Stop animation loop
           lastTime = 0;
           // Show upload container again
           uploadContainer.classList.remove('hidden');
           hideLoading(); // Ensure loading is hidden
           // No page reload needed now
           // window.location.reload();
         },
         onN64Toggle: (enabled) => {
           isN64Mode = enabled;
           if (currentImage && currentBBox) {
               proceedWithCroppedImage(currentImage, currentBBox);
           }
         }
       });
    }

    // Start animation loop or reset time
    if (lastTime === 0) {
        lastTime = performance.now();
        requestAnimationFrame(animate);
    } else {
        lastTime = performance.now();
    }

    hideLoading(); // Hide loading ONLY after everything is set up

  } catch (error) {
    console.error("Error creating mesh:", error);
    hideLoading();
    uploadContainer.classList.remove('hidden');
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
  domElement.removeEventListener('pointerdown', handlePointerDown);
  domElement.removeEventListener('pointermove', handlePointerMove);
  domElement.removeEventListener('pointerup', handlePointerUp);
  domElement.removeEventListener('pointerleave', handlePointerUp); // Handle leaving canvas
  domElement.removeEventListener('touchstart', handlePointerDown);
  domElement.removeEventListener('touchmove', handlePointerMove);
  domElement.removeEventListener('touchend', handlePointerUp);

  // Add new listeners
  domElement.addEventListener('pointerdown', handlePointerDown);
  domElement.addEventListener('pointermove', handlePointerMove);
  domElement.addEventListener('pointerup', handlePointerUp);
  domElement.addEventListener('pointerleave', handlePointerUp);
  domElement.addEventListener('touchstart', handlePointerDown, { passive: false }); // passive: false for potential preventDefault
  domElement.addEventListener('touchmove', handlePointerMove, { passive: false });
  domElement.addEventListener('touchend', handlePointerUp);
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function animate(now) {
  if (!mesh) { // Stop loop if mesh is removed (e.g., New Image)
      lastTime = 0; // Reset time to indicate loop stopped
      return;
  }
  const dt = (now - lastTime) / 1000;
  updateSprings(Math.min(dt, 0.1)); // Clamp dt to avoid instability
  renderer.render(scene, camera);
  lastTime = now;
  requestAnimationFrame(animate);
}

// Add a check for cropperUI readiness if needed, or ensure init runs after DOM load
document.addEventListener('DOMContentLoaded', init);
// init(); // Call init directly if script is at the end of body or defer
