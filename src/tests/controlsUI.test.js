import { initControls } from '../ui/controlsUI.js';

describe('controls UI', () => {
  test('initializes without errors and sets ARIA labels', () => {
    const gui = initControls({
      onReset: jest.fn(),
      onDownload: jest.fn(),
      onParamsChange: jest.fn(),
      onNewImage: jest.fn(),
      onN64Toggle: jest.fn(),
      onCurvatureChange: jest.fn(),
    });

    const radiusCtrl = gui.__controllers.find((c) => c.property === 'radius');
    const radiusInput = radiusCtrl.domElement.querySelector('input');
    expect(radiusInput.getAttribute('aria-label')).toBe('Brush Radius');

    const curvatureCtrl = gui.__controllers.find((c) => c.property === 'curvature');
    const curInput = curvatureCtrl.domElement.querySelector('input');
    expect(curInput.getAttribute('aria-label')).toBe('Curvature');

    gui.destroy();
  });
});
