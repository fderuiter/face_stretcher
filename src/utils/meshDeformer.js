import * as THREE from 'three';

let positions, originalPos, velocities, vertexCount, geo, mesh, texture;

/**
 * Creates a subdivided plane mesh, sets up userData for springs.
 * @param {THREE.Texture} initialTexture
 * @param {number} width
 * @param {number} height
 * @param {number} segments - Controls the mesh resolution.
 * @param {boolean} pixelated - If true, use nearest neighbor filtering.
 */
export function createMesh(initialTexture, width, height, segments, pixelated = false) {
  texture = initialTexture;
  texture.needsUpdate = true; // Ensure texture updates

  // Apply pixelation if requested
  if (pixelated) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  } else {
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
  }

  geo = new THREE.PlaneGeometry(width, height, segments, segments);
  vertexCount = geo.attributes.position.count;
  positions = geo.attributes.position;
  originalPos = positions.array.slice();
  velocities = new Float32Array(vertexCount * 3).fill(0);

  const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }); // Use DoubleSide
  mesh = new THREE.Mesh(geo, mat);

  // default spring params & brush
  mesh.userData.radius = 0.3;
  mesh.userData.strength = 1.0;
  mesh.userData.kStiff = 8;
  mesh.userData.damping = 4;
  mesh.userData.segments = segments; // Store segments count
  mesh.userData.pixelated = pixelated; // Store pixelated state

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

/**
 * Updates the mesh texture.
 * @param {THREE.Texture} newTexture
 */
export function updateTexture(newTexture) {
  if (mesh && mesh.material) {
    texture = newTexture;
    texture.needsUpdate = true;
    // Re-apply filtering based on current mode
    if (mesh.userData.pixelated) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
    } else {
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
    }
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
  }
}

/**
 * Updates the mesh geometry (resolution).
 * @param {number} width
 * @param {number} height
 * @param {number} segments
 */
export function updateGeometry(width, height, segments) {
  if (mesh) {
    geo.dispose(); // Dispose old geometry
    geo = new THREE.PlaneGeometry(width, height, segments, segments);
    vertexCount = geo.attributes.position.count;
    positions = geo.attributes.position;
    originalPos = positions.array.slice();
    velocities = new Float32Array(vertexCount * 3).fill(0);
    mesh.geometry = geo;
    mesh.userData.segments = segments;
  }
}

/** Getters for mesh properties */
export function getMeshDimensions() {
  return geo ? { width: geo.parameters.width, height: geo.parameters.height } : null;
}

export function getTextureData() {
  return texture;
}
