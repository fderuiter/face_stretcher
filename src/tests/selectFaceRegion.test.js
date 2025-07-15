import { selectFaceRegion } from '../utils/selectFaceRegion.js';
import * as faceDetection from '../utils/faceDetection.js';
import * as cropperUI from '../ui/cropperUI.js';

describe('selectFaceRegion', () => {
  const img = new Image();
  const file = new File(['a'], 'test.png', { type: 'image/png' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns detected bbox when face detection succeeds', async () => {
    jest.spyOn(faceDetection, 'detectFace').mockResolvedValue({ x: 1, y: 2, width: 3, height: 4 });
    const spy = jest.spyOn(cropperUI, 'showCropper').mockResolvedValue(null);
    const result = await selectFaceRegion(img, file);
    expect(faceDetection.detectFace).toHaveBeenCalledWith(img);
    expect(spy).not.toHaveBeenCalled();
    expect(result).toEqual({ image: img, bbox: { x: 1, y: 2, width: 3, height: 4 } });
  });

  test('falls back to manual cropper when detection fails', async () => {
    jest.spyOn(faceDetection, 'detectFace').mockRejectedValue(new Error('fail'));
    const manual = { imageElement: img, cropData: { x: 5, y: 6, width: 7, height: 8 } };
    jest.spyOn(cropperUI, 'showCropper').mockResolvedValue(manual);
    const result = await selectFaceRegion(img, file);
    expect(cropperUI.showCropper).toHaveBeenCalledWith(true, file);
    expect(result).toEqual({ image: img, bbox: manual.cropData });
  });

  test('throws when manual cropper is cancelled', async () => {
    jest.spyOn(faceDetection, 'detectFace').mockRejectedValue(new Error('fail'));
    jest.spyOn(cropperUI, 'showCropper').mockResolvedValue(null);
    await expect(selectFaceRegion(img, file)).rejects.toThrow('ERR_SR_001');
  });
});
