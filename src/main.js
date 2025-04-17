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

let renderer, scene, camera, mesh, controls;
let lastTime = performance.now();
let isN64Mode = false;
const N64_SEGMENTS = 10; // Low resolution for N64 mode
const HD_SEGMENTS = 100; // High resolution for HD mode
let currentImage = null; // Store the original full image
let currentBBox = null; // Store the bounding box used

const uploadContainer = document.getElementById('upload-container');

async function init() {
  uploadContainer.classList.remove('hidden'); // Ensure upload is visible initially
  const img = await showCropper();
  currentImage = img; // Store the full image
  hideCropper();
  uploadContainer.classList.add('hidden'); // Hide upload after selection

  const spinner = document.getElementById('loading-spinner');
  spinner.classList.remove('hidden');

  let bbox;
  let detectionFailed = false;
  try {
    bbox = await detectFace(img);
    currentBBox = bbox; // Store detected bbox
  } catch {
    detectionFailed = true;
  }
  spinner.classList.add('hidden');

  if (detectionFailed) {
    // Show manual cropper if detection fails
    const manualImgData = await showCropper(true); // Pass flag to indicate re-crop
    hideCropper();
    uploadContainer.classList.add('hidden'); // Hide upload again
    // Use the manually cropped image data for the rest of the workflow
    // The cropperUI now returns { imageElement, cropData }
    currentImage = manualImgData.imageElement;
    currentBBox = manualImgData.cropData; // Store manual crop data
    proceedWithCroppedImage(currentImage, currentBBox);
    return;
  }

  // Center crop region on detected face
  proceedWithCroppedImage(img, bbox);
}

function proceedWithCroppedImage(img, bbox) {
  const cropped = document.createElement('canvas');
  cropped.width = bbox.width;
  cropped.height = bbox.height;
  const ctx = cropped.getContext('2d');
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

  if (!renderer) { // First time setup
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true }); // preserveDrawingBuffer for saving
    renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onWindowResize, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
  }

  const segments = isN64Mode ? N64_SEGMENTS : HD_SEGMENTS;
  const meshWidth = 2;
  const meshHeight = 2 * (bbox.height / bbox.width);

  if (mesh) {
    scene.remove(mesh); // Remove old mesh if exists
  }

  mesh = createMesh(
    canvasTexture,
    meshWidth,
    meshHeight,
    segments,
    isN64Mode // Pass pixelated flag
  );
  scene.add(mesh);

  // Re-setup interaction if needed (or ensure it works with new mesh)
  setupInteraction();

  if (!controls) { // Initialize controls only once
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
        if (mesh) scene.remove(mesh);
        if (controls) controls.destroy();
        controls = null;
        mesh = null;
        // Simply reload the page to start fresh
        window.location.reload();
      },
      onN64Toggle: (enabled) => {
        isN64Mode = enabled;
        // Recreate mesh with new settings
        if (currentImage && currentBBox) {
            proceedWithCroppedImage(currentImage, currentBBox);
        }
      }
    });
  }

  // Start animation loop if not already running
  if (lastTime === 0) { // Check if it's the first run
      lastTime = performance.now();
      requestAnimationFrame(animate);
  } else {
      lastTime = performance.now(); // Reset timer if recreating mesh
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
