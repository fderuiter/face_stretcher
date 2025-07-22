import * as THREE from 'three';
import * as meshDeformer from '../utils/meshDeformer.js';
import { generateMesh, N64_SEGMENTS, HD_SEGMENTS } from '../utils/generateMesh.js';

describe('generateMesh', () => {
  let canvas;
  let docMock;

  beforeEach(() => {
    canvas = new HTMLCanvasElement();
    canvas.width = 100;
    canvas.height = 50;
    docMock = { createElement: jest.fn(() => new HTMLCanvasElement()) };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates low-poly mesh in N64 mode', () => {
    const spy = jest.spyOn(meshDeformer, 'createMesh').mockReturnValue({ userData: {} });
    const mesh = generateMesh(canvas, true, 0, docMock);
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[3]).toBe(N64_SEGMENTS);
    expect(args[4]).toBe(true);
    expect(args[5]).toBe(0);
    expect(mesh).toBeDefined();
  });

  test('creates high-res mesh in HD mode', () => {
    const spy = jest.spyOn(meshDeformer, 'createMesh').mockReturnValue({ userData: {} });
    generateMesh(canvas, false, 0, docMock);
    const args = spy.mock.calls[0];
    expect(args[3]).toBe(HD_SEGMENTS);
    expect(args[4]).toBe(false);
    expect(args[5]).toBe(0);
  });

  test('passes curvature value to createMesh', () => {
    const spy = jest.spyOn(meshDeformer, 'createMesh').mockReturnValue({ userData: {} });
    generateMesh(canvas, true, 0.5, docMock);
    const args = spy.mock.calls[0];
    expect(args[5]).toBeCloseTo(0.5);
  });

  test('passes a CanvasTexture containing the source image', () => {
    const texSpy = jest
      .spyOn(THREE, 'CanvasTexture')
      .mockImplementation((img) => ({ image: img }));
    const spy = jest
      .spyOn(meshDeformer, 'createMesh')
      .mockReturnValue({ userData: {} });
    generateMesh(canvas, true, 0, docMock);
    expect(texSpy).toHaveBeenCalledWith(canvas);
    expect(spy.mock.calls[0][0].image).toBe(canvas);
    texSpy.mockRestore();
  });

  test('maintains aspect ratio when width > height', () => {
    const spy = jest.spyOn(meshDeformer, 'createMesh').mockReturnValue({ userData: {} });
    canvas.width = 200;
    canvas.height = 100;
    generateMesh(canvas, true, 0, docMock);
    const args = spy.mock.calls[0];
    expect(args[1]).toBeCloseTo(2); // width scaled to 2
    expect(args[2]).toBeCloseTo(1); // height scaled proportionally
  });

  test('maintains aspect ratio when height > width', () => {
    const spy = jest.spyOn(meshDeformer, 'createMesh').mockReturnValue({ userData: {} });
    canvas.width = 100;
    canvas.height = 200;
    generateMesh(canvas, true, 0, docMock);
    const args = spy.mock.calls[0];
    expect(args[1]).toBeCloseTo(1); // width scaled proportionally
    expect(args[2]).toBeCloseTo(2); // height scaled to 2
  });

  test('throws on invalid source', () => {
    expect(() => generateMesh(null)).toThrow('ERR_MG_001');
  });
});
