import * as THREE from 'three';
import { detectFace } from './utils/faceDetection.js';
import { showCropper, hideCropper } from './ui/cropperUI.js';
import { createMesh, stretchRegion, updateSprings, resetMesh } from './utils/meshDeformer.js';
import { initControls } from './ui/controlsUI.js';
import { captureCanvas } from './utils/share.js';

let renderer, scene, camera, mesh;
let lastTime = performance.now();

async function init() {
  const img = await showCropper();
  hideCropper();

  let bbox;
  try {
    bbox = await detectFace(img);
  } catch {
    bbox = { x: 0, y: 0, width: img.width, height: img.height };
  }
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

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 3);
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  mesh = createMesh(
    new THREE.CanvasTexture(cropped),
    2,
    2 * (bbox.height / bbox.width),
    100
  );
  scene.add(mesh);

  let isDown = false;
  const prevPt = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();

  function getHit(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    ptr.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    ptr.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObject(mesh);
    return hits[0] ? hits[0].point : null;
  }

  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDown = true;
    const p = getHit(e);
    if (p) prevPt.copy(p);
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const p = getHit(e);
    if (p) {
      stretchRegion(prevPt, p);
      prevPt.copy(p);
    }
  });
  renderer.domElement.addEventListener('pointerup', () => (isDown = false));

  initControls({
    onReset: () => resetMesh(),
    onDownload: () => captureCanvas(renderer.domElement),
    onParamsChange: ({ radius, strength, stiffness, damping }) => {
      mesh.userData.radius = radius;
      mesh.userData.strength = strength;
      mesh.userData.kStiff = stiffness;
      mesh.userData.damping = damping;
    }
  });

  function animate(now) {
    const dt = (now - lastTime) / 1000;
    updateSprings(dt);
    renderer.render(scene, camera);
    lastTime = now;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

init();
