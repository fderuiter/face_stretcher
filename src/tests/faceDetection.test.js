import { detectFace, __resetModel } from '../utils/faceDetection.js';

describe('detectFace', () => {
  const img = { width: 100, height: 100 };

  beforeEach(() => {
    __resetModel();
    global.mockEstimateFaces.mockReset();
    global.mockEstimateFaces.mockResolvedValue([
      { box: { xMin: 0, yMin: 0, xMax: 100, yMax: 100 } },
    ]);
  });

  test('returns bbox from detection', async () => {
    const bbox = await detectFace(img);
    expect(bbox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test('throws when no face found', async () => {
    global.mockEstimateFaces.mockResolvedValueOnce([]);
    await expect(detectFace(img)).rejects.toThrow('ERR_FD_002');
  });

  test('throws on invalid input', async () => {
    await expect(detectFace(null)).rejects.toThrow('ERR_FD_004');
  });

  test('wraps model loading errors', async () => {
    const err = new Error('bad');
    global.faceLandmarksDetection.createDetector.mockRejectedValueOnce(err);
    await expect(detectFace(img)).rejects.toThrow('ERR_FD_003');
  });

  test('wraps WebGL errors', async () => {
    global.mockEstimateFaces.mockRejectedValueOnce(new Error('WebGL context lost'));
    await expect(detectFace(img)).rejects.toThrow('ERR_FD_005');
  });
});
