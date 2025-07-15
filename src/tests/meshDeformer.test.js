import * as THREE from 'three';
import {
  createMesh,
  updateGeometry,
  stretchRegion,
  updateSprings,
  resetMesh,
  lockCurrentDeformation,
  unlockDeformation,
} from '../utils/meshDeformer.js';

describe('MeshDeformer Tests', () => {
    let texture, mesh;

    beforeEach(() => {
        // Create a simple test texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        texture = new THREE.CanvasTexture(canvas);
    });

    afterEach(() => {
        if (mesh) {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            }
        }
        if (texture) texture.dispose();
    });

    test('should create mesh with valid parameters', () => {
        mesh = createMesh(texture, 2, 2, 10);
        expect(mesh).toBeDefined();
        expect(mesh.geometry).toBeDefined();
        expect(mesh.material).toBeDefined();
        expect(mesh.userData.radius).toBe(0.3);
        expect(mesh.userData.strength).toBe(1.0);
        expect(mesh.userData.kStiff).toBe(8);
        expect(mesh.userData.damping).toBe(4);
    });

    test('should throw on invalid mesh parameters', () => {
        expect(() => createMesh(null, 2, 2, 10)).toThrow('ERR_MD_001');
        expect(() => createMesh(texture, -1, 2, 10)).toThrow('ERR_MD_001');
        expect(() => createMesh(texture, 2, -1, 10)).toThrow('ERR_MD_001');
        expect(() => createMesh(texture, 2, 2, 0)).toThrow('ERR_MD_001');
    });

    test('should correctly apply stretch deformation', () => {
        mesh = createMesh(texture, 2, 2, 10);
        const originalPositions = mesh.geometry.attributes.position.array.slice();
        const from = new THREE.Vector3(0, 0, 0);
        const to = new THREE.Vector3(0.5, 0.5, 0);
        
        stretchRegion(from, to);
        
        const newPositions = mesh.geometry.attributes.position.array;
        expect(newPositions).not.toEqual(originalPositions);
    });

    test('should correctly reset mesh', () => {
        mesh = createMesh(texture, 2, 2, 10);
        const originalPositions = mesh.geometry.attributes.position.array.slice();
        
        // Apply deformation
        const from = new THREE.Vector3(0, 0, 0);
        const to = new THREE.Vector3(0.5, 0.5, 0);
        stretchRegion(from, to);
        
        // Reset mesh
        resetMesh();
        
        const resetPositions = mesh.geometry.attributes.position.array;
        expect(resetPositions).toEqual(originalPositions);
    });

    test('should update springs correctly', () => {
        mesh = createMesh(texture, 2, 2, 10);
        const originalPositions = mesh.geometry.attributes.position.array.slice();
        
        // Apply deformation
        const from = new THREE.Vector3(0, 0, 0);
        const to = new THREE.Vector3(0.5, 0.5, 0);
        stretchRegion(from, to);
        
        // Update springs
        updateSprings(0.016); // Simulate one frame at 60fps
        
        const updatedPositions = mesh.geometry.attributes.position.array;
        expect(updatedPositions).not.toEqual(originalPositions);
    });

    test('locked vertices remain until unlocked', () => {
        mesh = createMesh(texture, 2, 2, 10);
        const from = new THREE.Vector3(0, 0, 0);
        const to = new THREE.Vector3(0.5, 0, 0);
        stretchRegion(from, to);
        lockCurrentDeformation();
        const lockedPos = mesh.geometry.attributes.position.array.slice();
        stretchRegion(from, new THREE.Vector3(1, 0, 0));
        expect(mesh.geometry.attributes.position.array).toEqual(lockedPos);
        updateSprings(0.016);
        expect(mesh.geometry.attributes.position.array).toEqual(lockedPos);
        unlockDeformation();
        updateSprings(0.016);
        expect(mesh.geometry.attributes.position.array).not.toEqual(lockedPos);
    });

    test('uses pixelated filtering when requested', () => {
        mesh = createMesh(texture, 2, 2, 10, true);
        expect(mesh.userData.pixelated).toBe(true);
    });

    test('updateGeometry adjusts segment count', () => {
        mesh = createMesh(texture, 2, 2, 8);
        updateGeometry(2, 2, 4);
        expect(mesh.userData.segments).toBe(4);
    });
});
