import { initKeyboardControls } from '../ui/keyboardControls.js';

describe('keyboard controls', () => {
  test('basic key interactions', () => {
    const onMove = jest.fn();
    const onGrabStart = jest.fn();
    const onGrabMove = jest.fn();
    const onGrabEnd = jest.fn();
    const onLockStart = jest.fn();
    const onLockEnd = jest.fn();
    const onZoom = jest.fn();
    const onRotate = jest.fn();
    const onExit = jest.fn();

    const kc = initKeyboardControls({
      onMove,
      onGrabStart,
      onGrabMove,
      onGrabEnd,
      onLockStart,
      onLockEnd,
      onZoom,
      onRotate,
      onExit
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    expect(kc.state.cursor.x).toBeCloseTo(0.1);
    expect(onMove).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    expect(onGrabStart).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
    expect(onGrabMove).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));
    expect(onGrabEnd).toHaveBeenCalledWith(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
    expect(onLockStart).toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyR' }));
    expect(onLockEnd).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }));
    expect(onZoom).toHaveBeenCalledWith(1.5);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' }));
    expect(onRotate).toHaveBeenCalledWith('left');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    expect(onExit).toHaveBeenCalled();

    kc.destroy();
  });

  test('lock flag on grab end', () => {
    const onGrabEnd = jest.fn();
    const kc = initKeyboardControls({ onGrabEnd });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));

    expect(onGrabEnd).toHaveBeenCalledWith(true);
    kc.destroy();
  });

  test('custom step and zoom levels', () => {
    const onMove = jest.fn();
    const onZoom = jest.fn();
    const kc = initKeyboardControls({ onMove, onZoom, step: 0.2, zoomLevels: [1, 2] });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    expect(kc.state.cursor.x).toBeCloseTo(0.2);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }));
    expect(onZoom).toHaveBeenLastCalledWith(2);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }));
    expect(onZoom).toHaveBeenLastCalledWith(1);

    kc.destroy();
  });
});
