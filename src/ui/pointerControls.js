import * as THREE from 'three';
import { snapToGrabPoints } from '../utils/grabPoints.js';

export function initPointerControls({
  renderer,
  camera,
  mesh,
  onDrag = () => {},
  grabPoints = [],
  snapDistance = 0.25,
  raycaster = new THREE.Raycaster(),
  vector = new THREE.Vector2()
} = {}) {
  if (!renderer || !camera || !mesh) {
    return { destroy() {} };
  }

  let isDown = false;
  const prevPt = new THREE.Vector3();
  const ray = raycaster;
  const ptr = vector;

  function getHit(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX ?? (event.touches && event.touches[0].clientX);
    const y = event.clientY ?? (event.touches && event.touches[0].clientY);
    if (x == null || y == null) return null;
    ptr.x = ((x - rect.left) / rect.width) * 2 - 1;
    ptr.y = -((y - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObject(mesh);
    return hits[0] ? hits[0].point : null;
  }

  function handleDown(e) {
    const p = getHit(e);
    if (p && snapToGrabPoints(p, grabPoints, snapDistance)) {
      isDown = true;
      prevPt.copy(p);
    } else {
      isDown = false;
    }
  }

  function handleMove(e) {
    if (!isDown) return;
    const p = getHit(e);
    if (p) {
      snapToGrabPoints(p, grabPoints, snapDistance);
      onDrag(prevPt, p);
      prevPt.copy(p);
    }
  }

  function handleUp() {
    isDown = false;
  }

  const el = renderer.domElement;
  el.addEventListener('pointerdown', handleDown);
  el.addEventListener('pointermove', handleMove);
  el.addEventListener('pointerup', handleUp);
  el.addEventListener('pointerleave', handleUp);
  el.addEventListener('touchstart', handleDown, { passive: false });
  el.addEventListener('touchmove', handleMove, { passive: false });
  el.addEventListener('touchend', handleUp);

  return {
    destroy() {
      el.removeEventListener('pointerdown', handleDown);
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerup', handleUp);
      el.removeEventListener('pointerleave', handleUp);
      el.removeEventListener('touchstart', handleDown);
      el.removeEventListener('touchmove', handleMove);
      el.removeEventListener('touchend', handleUp);
    }
  };
}
