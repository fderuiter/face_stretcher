import { autoCrop } from '../utils/autoCrop.js';
import * as faceDetection from '../utils/faceDetection.js';

describe('autoCrop utility', () => {
  const img = new Image();
  img.width = 100;
  img.height = 100;

  const makeDoc = () => {
    const canvas = {
      getContext: jest.fn(() => ({ drawImage: jest.fn() })),
      width: 0,
      height: 0
    };
    return {
      createElement: jest.fn(() => canvas),
      canvas
    };
  };

  test('crops image using centered square around detected face', async () => {
    jest.spyOn(faceDetection, 'detectFace').mockResolvedValue({ x: 5, y: 5, width: 20, height: 30 });
    const doc = makeDoc();
    const result = await autoCrop(img, doc);
    expect(faceDetection.detectFace).toHaveBeenCalledWith(img);
    expect(result.bbox).toEqual({ x: 0, y: 5, width: 30, height: 30 });
    expect(doc.canvas.width).toBe(30);
    expect(doc.canvas.height).toBe(30);
  });

  test('propagates detection errors', async () => {
    jest.spyOn(faceDetection, 'detectFace').mockRejectedValue(new Error('fail'));
    const doc = makeDoc();
    await expect(autoCrop(img, doc)).rejects.toThrow('fail');
  });
});
