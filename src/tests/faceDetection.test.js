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
    });

    test('should handle missing face', async () => {
        const mockImage = {
            width: 500,
            height: 500
        };
        
        // Mock the face detection to return no faces
        jest.spyOn(global, 'faceLandmarksDetection').mockImplementation(() => ({
            estimateFaces: async () => []
        }));

        await expect(detectFace(mockImage)).rejects.toThrow('ERR_FD_002');
    });

    test('should handle invalid input', async () => {
        await expect(detectFace(null)).rejects.toThrow('ERR_FD_004');
        await expect(detectFace(undefined)).rejects.toThrow('ERR_FD_004');
    });

    test('should handle model loading failure', async () => {
        // Mock model loading failure
        jest.spyOn(global, 'faceLandmarksDetection').mockImplementation(() => {
            throw new Error('Model load failed');
        });

        const mockImage = {
            width: 500,
            height: 500
        };

        await expect(detectFace(mockImage)).rejects.toThrow('ERR_FD_003');
    });

    test('should handle WebGL context errors', async () => {
        // Mock WebGL context error
        jest.spyOn(global, 'faceLandmarksDetection').mockImplementation(() => {
            throw new Error('WebGL context lost');
        });

        const mockImage = {
            width: 500,
            height: 500
        };

        await expect(detectFace(mockImage)).rejects.toThrow('ERR_FD_005');
    });
});
