require('@testing-library/jest-dom');

// Mock Three.js
jest.mock('three', () => ({
    WebGLRenderer: jest.fn(),
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    PlaneGeometry: jest.fn(() => ({
        attributes: {
            position: {
                count: 100,
                array: new Float32Array(300),
            }
        },
        dispose: jest.fn()
    })),
    MeshBasicMaterial: jest.fn(() => ({
        dispose: jest.fn()
    })),    Mesh: jest.fn(() => ({
        position: { set: jest.fn() },
        scale: { set: jest.fn() },
        rotation: { set: jest.fn() },
        userData: {},
        geometry: {
            attributes: {
                position: {
                    count: 100,
                    array: new Float32Array(300)
                }
            }
        }
    })),    Vector2: jest.fn(() => ({ 
        x: 0, 
        y: 0,
        subVectors: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis()
    })),
    Vector3: jest.fn(() => ({ 
        x: 0, 
        y: 0, 
        z: 0,
        subVectors: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis(),
        length: jest.fn().mockReturnValue(1),
        normalize: jest.fn().mockReturnThis()
    })),
    Raycaster: jest.fn(),
    CanvasTexture: jest.fn(() => ({
        dispose: jest.fn()
    })),
    AmbientLight: jest.fn(),
    NearestFilter: 'nearest',
    LinearFilter: 'linear',
    DoubleSide: 'double',
}));

// Mock TensorFlow
const mockEstimateFaces = jest.fn().mockResolvedValue([{
    mesh: [[0, 0, 0]],
    scaledMesh: [[0, 0, 0]],
    boundingBox: {
        topLeft: [0, 0],
        bottomRight: [100, 100]
    }
}]);

const mockModel = {
    estimateFaces: mockEstimateFaces
};

jest.mock('@tensorflow-models/face-landmarks-detection', () => ({
    load: jest.fn().mockResolvedValue(mockModel),
    SupportedPackages: {
        mediapipeFacemesh: 'mediapipeFacemesh'
    }
}));

// Make mock functions available globally for tests
global.mockEstimateFaces = mockEstimateFaces;

// Mock TensorFlow globally
global.faceLandmarksDetection = {
    load: jest.fn().mockResolvedValue({
        estimateFaces: jest.fn().mockResolvedValue([{
            box: { xMin: 0, yMin: 0, xMax: 100, yMax: 100 },
            mesh: [[0, 0, 0]],
            scaledMesh: [[0, 0, 0]]
        }])
    }),
    SupportedPackages: {
        mediapipeFacemesh: 'mediapipeFacemesh'
    }
};

// Mock document and URL for share tests
global.document = {
    createElement: jest.fn(() => ({
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: {}
    }))
};

global.URL = {
    createObjectURL: jest.fn(() => 'blob://mock-url'),
    revokeObjectURL: jest.fn()
};
