import * as THREE from 'three';

export function initPointerControls({
  renderer,
  camera,
  mesh,
  onDrag = () => {},
  raycaster = new THREE.Raycaster(),
  vector = new THREE.Vector2(),
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
    isDown = true;
    const p = getHit(e);
    if (p) prevPt.copy(p);
  }

  function handleMove(e) {
    if (!isDown) return;
    const p = getHit(e);
    if (p) {
      onDrag(prevPt, p);
      prevPt.copy(p);
    }
  }

  function handleUp() {
    isDown = false;
  }

  const el = renderer.domElement;
  const listeners = [
    ['pointerdown', handleDown],
    ['pointermove', handleMove],
    ['pointerup', handleUp],
    ['pointerleave', handleUp],
    ['touchstart', handleDown, { passive: false }],
    ['touchmove', handleMove, { passive: false }],
    ['touchend', handleUp],
  ];

  listeners.forEach(([type, fn, opts]) => el.addEventListener(type, fn, opts));

  return {
    destroy() {
      listeners.forEach(([type, fn, opts]) =>
        el.removeEventListener(type, fn, opts)
      );
    },
  };
}
