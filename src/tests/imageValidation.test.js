import { validateImage } from '../utils/imageValidation.js';

describe('Image Validation Tests', () => {
    test('should validate supported image formats', () => {
        const validJPEG = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const validPNG = new File([''], 'test.png', { type: 'image/png' });
        const validWEBP = new File([''], 'test.webp', { type: 'image/webp' });

        expect(validateImage(validJPEG)).toBe(true);
        expect(validateImage(validPNG)).toBe(true);
        expect(validateImage(validWEBP)).toBe(true);
    });

    test('should reject unsupported formats', () => {
        const invalidGIF = new File([''], 'test.gif', { type: 'image/gif' });
        const invalidSVG = new File([''], 'test.svg', { type: 'image/svg+xml' });
        const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });

        expect(() => validateImage(invalidGIF)).toThrow('ERR_IV_001');
        expect(() => validateImage(invalidSVG)).toThrow('ERR_IV_001');
        expect(() => validateImage(invalidFile)).toThrow('ERR_IV_001');
    });

    test('should validate image dimensions', () => {
        const tooLargeImage = { width: 10000, height: 10000 };
        const tooSmallImage = { width: 10, height: 10 };
        const validImage = { width: 1024, height: 768 };

        expect(() => validateImage(null, tooLargeImage)).toThrow('ERR_IV_002');
        expect(() => validateImage(null, tooSmallImage)).toThrow('ERR_IV_003');
        expect(validateImage(null, validImage)).toBe(true);
    });

    test('should validate image file size', () => {
        const tooLargeFile = new File([''], 'large.jpg', { type: 'image/jpeg', size: 15 * 1024 * 1024 });
        expect(() => validateImage(tooLargeFile)).toThrow('ERR_IV_004');
    });
});
