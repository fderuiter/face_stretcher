import * as THREE from 'three';
import { logError } from './analytics.js';

let positions,
  originalPos,
  velocities,
  vertexCount,
  geo,
  mesh,
  texture,
  lockedVerts,
  springWorker;

let useWorker = false;

// Error codes:
// ERR_MD_001: Invalid mesh parameters
// ERR_MD_002: Texture creation failed
// ERR_MD_003: Geometry creation failed
// ERR_MD_004: Update geometry failed
// ERR_MD_005: Spring update error
// ERR_MD_006: Stretch region error

export function createMeshFromData(meshData) {
  try {
    const {
      geometryData,
      textureBitmap,
      segments,
      pixelated,
      curvature
    } = meshData;

    texture = new THREE.CanvasTexture(textureBitmap);
    texture.needsUpdate = true;

    if (pixelated) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
    } else {
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
    }

    geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(geometryData.positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(geometryData.uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(geometryData.indices, 1));

    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    mesh = new THREE.Mesh(geo, mat);

    geo = mesh.geometry;
    positions = geo.attributes.position;
    vertexCount = positions.count;
    originalPos = positions.array.slice();
    velocities = new Float32Array(vertexCount * 3).fill(0);
    lockedVerts = new Uint8Array(vertexCount).fill(0);

    mesh.userData.radius = 0.3;
    mesh.userData.strength = 1.0;
    mesh.userData.kStiff = 8;
    mesh.userData.damping = 4;
    mesh.userData.segments = segments;
    mesh.userData.pixelated = pixelated;
    mesh.userData.curvature = curvature;

    return mesh;
  } catch (error) {
    logError(new Error(`[ERR_MD_003] Geometry creation failed: ${error.message}`));
    throw error;
  }
}

/**
 * Creates a subdivided plane mesh, sets up userData for springs.
 * This is now a wrapper for createMeshFromData for convenience, but the primary
 * creation path is via the worker and createMeshFromData.
 */
export function createMesh(
  initialTexture,
  width,
  height,
  segments,
  pixelated = false,
  curvature = 0
) {
  // This function is now mostly for mocking and compatibility.
  // The main path uses the worker.
  console.warn("createMesh is deprecated. Use the generation worker.");
  return mesh;
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
    logError(new Error(`[ERR_MD_006] Region stretch failed: ${error.message}`));
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
    if (useWorker && springWorker) {
      springWorker.postMessage({
        dt,
        positions: positions.array,
        originalPos,
        velocities,
        lockedVerts,
        kStiff: mesh.userData.kStiff,
        damping: mesh.userData.damping,
      });
    } else {
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
  } catch (error) {
    logError(new Error(`[ERR_MD_005] Spring physics update failed: ${error.message}`));
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

export function getSpringState() {
  return {
    positions: positions ? positions.array.slice() : null,
    originalPos: originalPos ? originalPos.slice() : null,
    velocities: velocities ? velocities.slice() : null,
    lockedVerts: lockedVerts ? lockedVerts.slice() : null,
  };
}

export function applySpringState({ positions: pos, velocities: vel }) {
  if (positions && pos) {
    positions.array.set(pos);
    positions.needsUpdate = true;
  }
  if (velocities && vel) {
    velocities.set(vel);
  }
}

export function enableSpringWorker() {
  if (typeof Worker === 'undefined' || springWorker) return;
  try {
    let url = './workers/springWorker.js';
    if (typeof document !== 'undefined') {
      url = new URL('./workers/springWorker.js', document.baseURI).href;
    }
    springWorker = new Worker(url, { type: 'module' });
    springWorker.onmessage = (e) => {
      applySpringState(e.data);
    };
    useWorker = true;
  } catch (err) {
    console.warn('Web Worker initialization failed:', err);
    springWorker = null;
  }
}

export function disableSpringWorker() {
  if (springWorker) {
    springWorker.terminate();
    springWorker = null;
  }
  useWorker = false;
}
