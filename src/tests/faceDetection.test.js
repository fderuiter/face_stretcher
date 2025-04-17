import { detectFace } from '../utils/faceDetection.js';

describe('Face Detection Tests', () => {
    beforeAll(() => {
        // Mock canvas and context for testing
        global.HTMLCanvasElement.prototype.getContext = () => ({
            drawImage: jest.fn()
        });
    });

    test('should detect face in valid image', async () => {
        const mockImage = {
            width: 500,
            height: 500
        };

        const bbox = await detectFace(mockImage);
        expect(bbox).toBeDefined();
        expect(bbox.x).toBeDefined();
        expect(bbox.y).toBeDefined();
        expect(bbox.width).toBeDefined();
        expect(bbox.height).toBeDefined();
    });    test('should handle missing face', async () => {
        const mockImage = {
            width: 500,
            height: 500
        };
        
        // Mock the face detection to return no faces
        mockEstimateFaces.mockImplementationOnce(async () => {
            throw new Error('[ERR_FD_002] No face detected');
        });

        await expect(detectFace(mockImage)).rejects.toThrow('[ERR_FD_002] No face detected');
    });

    test('should handle invalid input', async () => {
        await expect(detectFace(null)).rejects.toThrow('ERR_FD_004');
        await expect(detectFace(undefined)).rejects.toThrow('ERR_FD_004');
    });    test('should handle model loading failure', async () => {
        const mockImage = {
            width: 500,
            height: 500
        };

        // Mock model loading failure
        mockEstimateFaces.mockImplementationOnce(async () => {
            throw new Error('[ERR_FD_003] Model loading failed: Model could not be loaded');
        });

        await expect(detectFace(mockImage)).rejects.toThrow('[ERR_FD_003] Model loading failed');
    });    test('should handle WebGL context errors', async () => {
        const mockImage = {
            width: 500,
            height: 500
        };

        // Mock WebGL context error
        mockEstimateFaces.mockImplementationOnce(async () => {
            throw new Error('[ERR_FD_005] WebGL error: Context lost');
        });

        await expect(detectFace(mockImage)).rejects.toThrow('[ERR_FD_005] WebGL error');
    });
});
