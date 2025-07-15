const NativeURL = require('url').URL;
import { generateShareLink, loadSharedImage } from '../utils/shareLink.js';
beforeEach(() => { global.URL = NativeURL; });

describe('share link utilities', () => {
  test('generateShareLink creates URL with encoded image', () => {
    const canvas = { toDataURL: jest.fn(() => 'data:image/png;base64,abcd') };
    const loc = { href: 'https://example.com/' };
    const link = generateShareLink(canvas, loc);
    expect(link).toContain('img=data%3Aimage%2Fpng%3Bbase64%2Cabcd');
  });

  test('loadSharedImage returns Image when img param exists', () => {
    const loc = { href: 'https://example.com/?img=data:image/png;base64,abcd' };
    const img = loadSharedImage(loc);
    expect(img).toBeInstanceOf(Image);
    expect(img.src).toBe('data:image/png;base64,abcd');
  });

  test('loadSharedImage returns null without param', () => {
    const loc = { href: 'https://example.com/' };
    expect(loadSharedImage(loc)).toBeNull();
  });
});
