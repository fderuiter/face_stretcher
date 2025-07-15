import { snapToGrabPoints } from "../utils/grabPoints.js";
export function initKeyboardControls({
  onMove = () => {},
  onGrabStart = () => {},
  onGrabMove = () => {},
  onGrabEnd = () => {},
  onLockStart = () => {},
  onLockEnd = () => {},
  onZoom = () => {},
  onRotate = () => {},
  onExit = () => {},
  step = 0.1,
  zoomLevels = [1, 1.5, 2],
  grabPoints = [],
  snapDistance = 0.25
} = {}) {
  const state = {
    cursor: { x: 0, y: 0 },
    grabbing: false,
    rHeld: false,
    zoomLevels,
    zoomIndex: 0
  };

  function move(dx, dy) {
    state.cursor.x += dx;
    state.cursor.y += dy;
    snapToGrabPoints(state.cursor, grabPoints, snapDistance);
    onMove({ ...state.cursor });
    if (state.grabbing) {
      onGrabMove({ ...state.cursor });
    }
  }

  function handleKeydown(e) {
    switch (e.code) {
      case 'ArrowLeft':
        move(-step, 0);
        break;
      case 'ArrowRight':
        move(step, 0);
        break;
      case 'ArrowUp':
        move(0, step);
        break;
      case 'ArrowDown':
        move(0, -step);
        break;
      case 'KeyA':
        if (!state.grabbing) {
          state.grabbing = true;
          onGrabStart({ ...state.cursor });
        }
        break;
      case 'KeyR':
        if (!state.rHeld) {
          state.rHeld = true;
          onLockStart();
        }
        break;
      case 'KeyB':
        state.zoomIndex = (state.zoomIndex + 1) % state.zoomLevels.length;
        onZoom(state.zoomLevels[state.zoomIndex]);
        break;
      case 'KeyI':
        onRotate('up');
        break;
      case 'KeyJ':
        onRotate('left');
        break;
      case 'KeyK':
        onRotate('down');
        break;
      case 'KeyL':
        onRotate('right');
        break;
      case 'Enter':
        onExit();
        break;
    }
  }

  function handleKeyup(e) {
    switch (e.code) {
      case 'KeyA':
        if (state.grabbing) {
          state.grabbing = false;
          onGrabEnd(state.rHeld);
        }
        break;
      case 'KeyR':
        if (state.rHeld) {
          state.rHeld = false;
          onLockEnd();
        }
        break;
    }
  }

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);

  return {
    state,
    destroy() {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    }
  };
}
