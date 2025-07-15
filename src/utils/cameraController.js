export function createCameraController({
  camera,
  mesh,
  baseDistance = 5,
  step = Math.PI / 16
} = {}) {
  const orientation = { x: 0, y: 0 };

  function applyOrientation() {
    if (mesh && mesh.rotation && typeof mesh.rotation.set === 'function') {
      mesh.rotation.set(orientation.x, orientation.y, 0);
    }
  }

  function zoom(level = 1) {
    if (camera && camera.position) {
      camera.position.z = baseDistance / level;
    }
  }

  function rotate(dir) {
    switch (dir) {
      case 'left':
        orientation.y += step;
        break;
      case 'right':
        orientation.y -= step;
        break;
      case 'up':
        orientation.x -= step;
        break;
      case 'down':
        orientation.x += step;
        break;
      default:
        return;
    }
    applyOrientation();
  }

  return { orientation, zoom, rotate };
}
