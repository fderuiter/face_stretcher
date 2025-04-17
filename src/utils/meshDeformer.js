import * as THREE from 'three';

let positions, originalPos, velocities, vertexCount, geo, mesh;

/**
 * Creates a subdivided plane mesh, sets up userData for springs.
 */
export function createMesh(texture, width, height, segments) {
  geo = new THREE.PlaneGeometry(width, height, segments, segments);
  vertexCount = geo.attributes.position.count;
  positions = geo.attributes.position;
  originalPos = positions.array.slice();
  velocities = new Float32Array(vertexCount * 3).fill(0);

  const mat = new THREE.MeshBasicMaterial({ map: texture });
  mesh = new THREE.Mesh(geo, mat);

  // default spring params & brush
  mesh.userData.radius = 0.3;
  mesh.userData.strength = 1.0;
  mesh.userData.kStiff = 8;
  mesh.userData.damping = 4;

  return mesh;
}

/**
 * Smear vertices near `from` toward the drag vector (from→to).
 */
export function stretchRegion(from, to) {
  const drag = new THREE.Vector3().subVectors(to, from);
  const tmp = new THREE.Vector3();
  const { radius, strength } = mesh.userData;
  for (let i = 0; i < vertexCount; i++) {
    tmp.fromArray(originalPos, i * 3);
    const d = tmp.distanceTo(from);
    if (d > radius) continue;
    const falloff = 1 - d / radius;
    const idx = i * 3;
    positions.array[idx] += drag.x * strength * falloff;
    positions.array[idx + 1] += drag.y * strength * falloff;
    positions.array[idx + 2] += drag.z * strength * falloff;
  }
  positions.needsUpdate = true;
}

/**
 * Runs spring-damper on every vertex.
 */
export function updateSprings(dt) {
  const pos = positions.array;
  for (let i = 0; i < vertexCount; i++) {
    const idx = i * 3;
    const dx = pos[idx] - originalPos[idx];
    const dy = pos[idx + 1] - originalPos[idx + 1];
    const dz = pos[idx + 2] - originalPos[idx + 2];
    // Hooke’s law + damping
    const fx = -mesh.userData.kStiff * dx - mesh.userData.damping * velocities[idx];
    const fy = -mesh.userData.kStiff * dy - mesh.userData.damping * velocities[idx + 1];
    const fz = -mesh.userData.kStiff * dz - mesh.userData.damping * velocities[idx + 2];
    velocities[idx] += fx * dt;
    velocities[idx + 1] += fy * dt;
    velocities[idx + 2] += fz * dt;
    pos[idx] += velocities[idx] * dt;
    pos[idx + 1] += velocities[idx + 1] * dt;
    pos[idx + 2] += velocities[idx + 2] * dt;
  }
  positions.needsUpdate = true;
}

/**
 * Instantly snap all vertices back to original.
 */
export function resetMesh() {
  positions.array.set(originalPos);
  velocities.fill(0);
  positions.needsUpdate = true;
}
