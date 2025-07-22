import { snapToGrabPoints, createDefaultGrabPoints } from '../utils/grabPoints.js';

describe('grab points utils', () => {
  test('snapToGrabPoints snaps when close', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const p = { x: 0.05, y: 0.05 };
    const snapped = snapToGrabPoints(p, pts, 0.2);
    expect(snapped).toBe(true);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  test('snapToGrabPoints returns false when far', () => {
    const pts = [{ x: 0, y: 0 }];
    const p = { x: 1, y: 1 };
    const snapped = snapToGrabPoints(p, pts, 0.2);
    expect(snapped).toBe(false);
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(1);
  });

  test('createDefaultGrabPoints returns array', () => {
    const arr = createDefaultGrabPoints(2, 2);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThan(0);
  });
});
