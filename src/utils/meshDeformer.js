import * as THREE from 'three';

let positions,
  originalPos,
  velocities,
  vertexCount,
  geo,
  mesh,
  texture,
  lockedVerts;

// Error codes:
// ERR_MD_001: Invalid mesh parameters
// ERR_MD_002: Texture creation failed
// ERR_MD_003: Geometry creation failed
// ERR_MD_004: Update geometry failed
// ERR_MD_005: Spring update error
// ERR_MD_006: Stretch region error

/**
 * Creates a subdivided plane mesh, sets up userData for springs.
 */
export function createMesh(
  initialTexture,
  width,
  height,
  segments,
  pixelated = false,
  curvature = 0
) {
  try {
    if (!initialTexture || width <= 0 || height <= 0 || segments < 1) {
      throw new Error('[ERR_MD_001] Invalid mesh parameters');
    }

    texture = initialTexture;
    texture.needsUpdate = true;

    if (pixelated) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
    } else {
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
    }

    let curv = curvature;
    if (typeof curvature === 'boolean') curv = curvature ? 1 : 0;

    if (curv > 0) {
      const radius = width / 2;
      const thetaLength = Math.PI * curv;
      const thetaStart = (Math.PI - thetaLength) / 2;
      geo = new THREE.SphereGeometry(
        radius,
        segments,
        segments,
        -Math.PI / 2,
        Math.PI,
        thetaStart,
        thetaLength
      );
      const baseHeight = 2 * radius * Math.sin(thetaLength / 2);
      const scaleY = height / baseHeight;
      geo.scale(1, scaleY, 1);
    } else {
      geo = new THREE.PlaneGeometry(width, height, segments, segments);
    }
    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }); // Use DoubleSide
    mesh = new THREE.Mesh(geo, mat);

    // use geometry from mesh to support mocks
    geo = mesh.geometry;
    positions = geo.attributes.position;
    vertexCount = positions.count || geo.attributes.position.count;
    originalPos = positions.array.slice();
    velocities = new Float32Array(vertexCount * 3).fill(0);
    lockedVerts = new Uint8Array(vertexCount).fill(0);

    // default spring params & brush
    mesh.userData.radius = 0.3;
    mesh.userData.strength = 1.0;
    mesh.userData.kStiff = 8;
    mesh.userData.damping = 4;
    mesh.userData.segments = segments; // Store segments count
    mesh.userData.pixelated = pixelated; // Store pixelated state
    mesh.userData.curvature = curv; // Store curvature amount

    return mesh;
  } catch (error) {
    console.error(`[ERR_MD_003] Geometry creation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Smear vertices near `from` toward the drag vector (from→to).
 */
export function stretchRegion(from, to) {
  try {
    if (!from || !to || !mesh) {
      throw new Error('[ERR_MD_006] Invalid stretch parameters');
    }

    const drag = new THREE.Vector3().subVectors(to, from);
    const { strength, radius } = mesh.userData;
    const r2 = radius * radius;

    for (let i = 0; i < vertexCount; i++) {
      if (lockedVerts && lockedVerts[i]) continue;
      const idx = i * 3;
      const dx = positions.array[idx] - from.x;
      const dy = positions.array[idx + 1] - from.y;
      const dz = positions.array[idx + 2] - from.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq > r2) continue;
      const falloff = 1 - Math.sqrt(distSq) / radius;
      positions.array[idx] += drag.x * strength * falloff;
      positions.array[idx + 1] += drag.y * strength * falloff;
      positions.array[idx + 2] += drag.z * strength * falloff;
    }
    positions.needsUpdate = true;
  } catch (error) {
    console.error(`[ERR_MD_006] Region stretch failed: ${error.message}`);
    throw error;
  }
}

/**
 * Runs spring-damper on every vertex.
 */
export function updateSprings(dt) {
  try {
    if (!positions || !originalPos || !velocities || dt <= 0) {
      throw new Error('[ERR_MD_005] Invalid spring update parameters');
    }

    const pos = positions.array;
    for (let i = 0; i < vertexCount; i++) {
      const idx = i * 3;
      if (lockedVerts && lockedVerts[i]) {
        velocities[idx] = velocities[idx + 1] = velocities[idx + 2] = 0;
        continue;
      }
      const dx = pos[idx] - originalPos[idx];
      const dy = pos[idx + 1] - originalPos[idx + 1];
      const dz = pos[idx + 2] - originalPos[idx + 2];
      // Hooke's law + damping
      const fx = -mesh.userData.kStiff * dx -
        mesh.userData.damping * velocities[idx];
      const fy = -mesh.userData.kStiff * dy -
        mesh.userData.damping * velocities[idx + 1];
      const fz = -mesh.userData.kStiff * dz -
        mesh.userData.damping * velocities[idx + 2];
      velocities[idx] += fx * dt;
      velocities[idx + 1] += fy * dt;
      velocities[idx + 2] += fz * dt;
      pos[idx] += velocities[idx] * dt;
      pos[idx + 1] += velocities[idx + 1] * dt;
      pos[idx + 2] += velocities[idx + 2] * dt;
    }
    positions.needsUpdate = true;
  } catch (error) {
    console.error(`[ERR_MD_005] Spring physics update failed: ${error.message}`);
    throw error;
  }
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
export function updateGeometry(width, height, segments, curvature = mesh ? mesh.userData.curvature : 0) {
  if (mesh) {
    geo.dispose(); // Dispose old geometry
    let curv = curvature;
    if (typeof curvature === 'boolean') curv = curvature ? 1 : 0;
    if (curv > 0) {
      const radius = width / 2;
      const thetaLength = Math.PI * curv;
      const thetaStart = (Math.PI - thetaLength) / 2;
      geo = new THREE.SphereGeometry(
        radius,
        segments,
        segments,
        -Math.PI / 2,
        Math.PI,
        thetaStart,
        thetaLength
      );
      const baseHeight = 2 * radius * Math.sin(thetaLength / 2);
      const scaleY = height / baseHeight;
      geo.scale(1, scaleY, 1);
    } else {
      geo = new THREE.PlaneGeometry(width, height, segments, segments);
    }
    vertexCount = geo.attributes.position.count;
    positions = geo.attributes.position;
    originalPos = positions.array.slice();
    velocities = new Float32Array(vertexCount * 3).fill(0);
    lockedVerts = new Uint8Array(vertexCount).fill(0);
    mesh.geometry = geo;
    mesh.userData.segments = segments;
    mesh.userData.curvature = curv;
  }
}

/** Getters for mesh properties */
export function getMeshDimensions() {
  return geo ? { width: geo.parameters.width, height: geo.parameters.height } : null;
}

export function getTextureData() {
  return texture;
}

/**
 * Locks all vertices currently displaced from their original position.
 */
export function lockCurrentDeformation() {
  if (!positions || !originalPos || !lockedVerts) return;
  const pos = positions.array;
  for (let i = 0; i < vertexCount; i++) {
    const idx = i * 3;
    if (
      pos[idx] !== originalPos[idx] ||
      pos[idx + 1] !== originalPos[idx + 1] ||
      pos[idx + 2] !== originalPos[idx + 2]
    ) {
      lockedVerts[i] = 1;
    }
  }
}

/**
 * Unlocks all locked vertices so they can spring back.
 */
export function unlockDeformation() {
  if (lockedVerts) lockedVerts.fill(0);
}
