import { createCameraController } from '../utils/cameraController.js';

describe('camera controller', () => {
  test('zoom adjusts camera distance', () => {
    const camera = { position: { z: 5 } };
    const mesh = { rotation: { set: jest.fn() } };
    const ctl = createCameraController({ camera, mesh, baseDistance: 4 });
    ctl.zoom(2);
    expect(camera.position.z).toBeCloseTo(2);
  });

  test('rotate updates mesh orientation', () => {
    const camera = { position: { z: 5 } };
    const mesh = { rotation: { set: jest.fn() } };
    const ctl = createCameraController({ camera, mesh, step: Math.PI / 8 });
    ctl.rotate('left');
    expect(ctl.orientation.y).toBeCloseTo(Math.PI / 8);
    expect(mesh.rotation.set).toHaveBeenCalledWith(0, Math.PI / 8, 0);
  });
});
