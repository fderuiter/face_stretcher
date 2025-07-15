import { snapToGrabPoints, createDefaultGrabPoints } from '../utils/grabPoints.js';

describe('grab points utils', () => {
  test('snapToGrabPoints snaps when close', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const p = { x: 0.05, y: 0.05 };
    snapToGrabPoints(p, pts, 0.2);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  test('createDefaultGrabPoints returns array', () => {
    const arr = createDefaultGrabPoints(2, 2);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThan(0);
  });
});
