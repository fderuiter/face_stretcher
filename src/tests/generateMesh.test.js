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
    const mesh = generateMesh(canvas, true, docMock);
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[3]).toBe(N64_SEGMENTS);
    expect(args[4]).toBe(true);
    expect(mesh).toBeDefined();
  });

  test('creates high-res mesh in HD mode', () => {
    const spy = jest.spyOn(meshDeformer, 'createMesh').mockReturnValue({ userData: {} });
    generateMesh(canvas, false, docMock);
    const args = spy.mock.calls[0];
    expect(args[3]).toBe(HD_SEGMENTS);
    expect(args[4]).toBe(false);
  });

  test('throws on invalid source', () => {
    expect(() => generateMesh(null)).toThrow('ERR_MG_001');
  });
});
