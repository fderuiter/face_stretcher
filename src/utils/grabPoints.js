import * as THREE from 'three';

export function createDefaultGrabPoints(width = 2, height = 2) {
  const w = width / 2;
  const h = height / 2;
  return [
    new THREE.Vector3(0, h * 0.8, 0), // hat brim
    new THREE.Vector3(0, h * 0.2, 0), // nose
    new THREE.Vector3(-w * 0.5, 0, 0), // left cheek
    new THREE.Vector3(w * 0.5, 0, 0), // right cheek
    new THREE.Vector3(0, -h * 0.2, 0), // mustache
    new THREE.Vector3(-w * 0.8, h * 0.4, 0), // left ear
    new THREE.Vector3(w * 0.8, h * 0.4, 0), // right ear
    new THREE.Vector3(0, -h * 0.6, 0) // chin
  ];
}

export function snapToGrabPoints(point, grabPoints = [], threshold = 0.25) {
  let nearest = null;
  let min = threshold;
  for (const gp of grabPoints) {
    const dx = point.x - gp.x;
    const dy = point.y - gp.y;
    const dz = (point.z || 0) - (gp.z || 0);
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < min) {
      min = dist;
      nearest = gp;
    }
  }
  if (nearest) {
    point.x = nearest.x;
    point.y = nearest.y;
    if ('z' in nearest) point.z = nearest.z;
    return true;
  }
  return false;
}
