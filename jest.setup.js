require('@testing-library/jest-dom');

// Mock Three.js
jest.mock('three', () => ({
    WebGLRenderer: jest.fn(),
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),    PlaneGeometry: jest.fn(() => {
        const posArray = new Float32Array(300);
        for (let i = 0; i < 100; i++) {
            posArray[i * 3] = Math.random();
            posArray[i * 3 + 1] = Math.random();
            posArray[i * 3 + 2] = Math.random();
        }
        return {
            attributes: {
                position: {
                    count: 100,
                    array: posArray,
                    needsUpdate: false
                }
            },
            dispose: jest.fn()
        };
    }),
    MeshBasicMaterial: jest.fn(() => {
        const material = {
            dispose: jest.fn(),
            map: {
                dispose: jest.fn()
            }
        };
        return material;
    }),
    Mesh: jest.fn(() => {
        const geometry = {
            attributes: {
                position: {
                    count: 100,
                    array: new Float32Array(300),
                    needsUpdate: false
                }
            },
            dispose: jest.fn()
        };
        const material = {
            dispose: jest.fn(),
            map: {
                dispose: jest.fn()
            }
        };
        return {
            position: { set: jest.fn() },
            scale: { set: jest.fn() },
            rotation: { set: jest.fn() },
            userData: {
                radius: 0.3,
                strength: 1.0,
                kStiff: 8,
                damping: 4
            },
            geometry: geometry,
            material: material
        };
    }),Vector2: jest.fn(() => ({ 
        x: 0, 
        y: 0,
        subVectors: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis()
    })),    Vector3: jest.fn(() => ({ 
        x: 0, 
        y: 0, 
        z: 0,
        subVectors: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis(),
        length: jest.fn().mockReturnValue(1),
        normalize: jest.fn().mockReturnThis(),
        fromArray: jest.fn().mockReturnThis(),
        distanceTo: jest.fn().mockReturnValue(0.5),
        clone: jest.fn().mockReturnThis(),
        copy: jest.fn().mockReturnThis(),
        add: jest.fn().mockReturnThis(),
        toArray: jest.fn()
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
        estimateFaces: jest.fn().mockImplementation(async () => [{
            box: { xMin: 0, yMin: 0, xMax: 100, yMax: 100 },
            mesh: Array(468).fill([0, 0, 0]),
            scaledMesh: Array(468).fill([0, 0, 0])
        }])
    }),
    SupportedPackages: {
        mediapipeFacemesh: 'mediapipeFacemesh'
    }
};

// Mock document and URL for share tests
global.document = {
    createElement: jest.fn((type) => {
        if (type === 'a') {
            return {
                setAttribute: jest.fn(),
                click: jest.fn(),
                style: {},
                href: '',
                download: ''
            };
        }
        return {
            setAttribute: jest.fn(),
            click: jest.fn(),
            style: {}
        };
    })
};

global.URL = {
    createObjectURL: jest.fn(() => 'blob://mock-url'),
    revokeObjectURL: jest.fn()
};

// Mock canvas API
HTMLCanvasElement.prototype.toBlob = function(callback) {
    callback(new Blob(['mock-image-data'], { type: 'image/png' }));
};
