import { captureCanvas } from '../utils/share.js';

describe('Share Functionality Tests', () => {
    let mockCanvas;
    let mockURL;
    let mockDocument;

    beforeEach(() => {
        // Mock canvas and blob
        mockCanvas = {
            toBlob: jest.fn(callback => callback(new Blob())),
        };

        // Mock URL functionality
        mockURL = {
            createObjectURL: jest.fn(() => 'mock-url'),
            revokeObjectURL: jest.fn(),
        };
        global.URL = mockURL;

        // Mock document createElement
        mockDocument = {
            createElement: jest.fn(() => ({
                click: jest.fn(),
            })),
        };
        global.document = mockDocument;
    });

    test('should capture canvas and trigger download', () => {
        captureCanvas(mockCanvas, mockDocument, mockURL);
        
        expect(mockCanvas.toBlob).toHaveBeenCalled();
        expect(mockURL.createObjectURL).toHaveBeenCalled();
        expect(mockDocument.createElement).toHaveBeenCalledWith('a');
        expect(mockURL.revokeObjectURL).toHaveBeenCalled();
    });

    test('should handle invalid canvas', () => {
        expect(() => captureCanvas(null, mockDocument, mockURL)).toThrow('ERR_SH_001');
        expect(() => captureCanvas(undefined, mockDocument, mockURL)).toThrow('ERR_SH_001');
    });

    test('should handle blob creation failure', () => {
        mockCanvas.toBlob = jest.fn(callback => callback(null));
        
        expect(() => captureCanvas(mockCanvas, mockDocument, mockURL)).toThrow('ERR_SH_002');
    });

    test('should handle download failure', () => {
        mockDocument.createElement = jest.fn(() => {
            throw new Error('Download failed');
        });
        
        expect(() => captureCanvas(mockCanvas, mockDocument, mockURL)).toThrow('ERR_SH_003');
    });
});
