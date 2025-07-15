import * as THREE from 'three';
import { initPointerControls } from '../ui/pointerControls.js';

describe('pointer controls', () => {
  test('drag callbacks fired', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
    const renderer = { domElement: canvas };
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
    const onDrag = jest.fn();
    const raycaster = {
      setFromCamera: jest.fn(),
      intersectObject: jest.fn(() => [{ point: new THREE.Vector3(0, 0, 0) }])
    };

    const ctl = initPointerControls({ renderer, camera, mesh, onDrag, raycaster });
    canvas.dispatchEvent(new MouseEvent('pointerdown', { clientX: 10, clientY: 10 }));
    canvas.dispatchEvent(new MouseEvent('pointermove', { clientX: 15, clientY: 15 }));
    expect(onDrag).toHaveBeenCalled();
    canvas.dispatchEvent(new MouseEvent('pointerup', { clientX: 15, clientY: 15 }));
    ctl.destroy();
  });

  test('destroy removes listeners', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
    const renderer = { domElement: canvas };
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
    const raycaster = {
      setFromCamera: jest.fn(),
      intersectObject: jest.fn(() => [{ point: new THREE.Vector3(0, 0, 0) }])
    };

    const onDrag = jest.fn();
    const ctl = initPointerControls({ renderer, camera, mesh, onDrag, raycaster });
    ctl.destroy();
    canvas.dispatchEvent(new MouseEvent('pointerdown', { clientX: 5, clientY: 5 }));
    canvas.dispatchEvent(new MouseEvent('pointermove', { clientX: 6, clientY: 6 }));
    expect(onDrag).not.toHaveBeenCalled();
  });
});
