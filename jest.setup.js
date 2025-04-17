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
    })),    Vector3: jest.fn(() => {
        const vec = {
            x: 0,
            y: 0,
            z: 0,
            subVectors: jest.fn((a, b) => {
                vec.x = a.x - b.x;
                vec.y = a.y - b.y;
                vec.z = a.z - b.z;
                return vec;
            }),
            multiplyScalar: jest.fn((scalar) => {
                vec.x *= scalar;
                vec.y *= scalar;
                vec.z *= scalar;
                return vec;
            }),
            length: jest.fn(() => Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)),
            normalize: jest.fn(() => {
                const len = vec.length();
                if (len > 0) {
                    vec.x /= len;
                    vec.y /= len;
                    vec.z /= len;
                }
                return vec;
            }),
            fromArray: jest.fn((array, offset = 0) => {
                vec.x = array[offset];
                vec.y = array[offset + 1];
                vec.z = array[offset + 2];
                return vec;
            }),
            distanceTo: jest.fn((v) => {
                const dx = vec.x - v.x;
                const dy = vec.y - v.y;
                const dz = vec.z - v.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            }),
            clone: jest.fn(() => new THREE.Vector3().copy(vec)),
            copy: jest.fn((v) => {
                vec.x = v.x;
                vec.y = v.y;
                vec.z = v.z;
                return vec;
            }),
            add: jest.fn((v) => {
                vec.x += v.x;
                vec.y += v.y;
                vec.z += v.z;
                return vec;
            }),
            toArray: jest.fn((array = [], offset = 0) => {
                array[offset] = vec.x;
                array[offset + 1] = vec.y;
                array[offset + 2] = vec.z;
                return array;
            })
        };
        return vec;
    }),
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
const mockFaceLandmarksDetection = jest.fn();
mockFaceLandmarksDetection.load = jest.fn().mockResolvedValue({
    estimateFaces: jest.fn().mockImplementation(async () => [{
        box: { xMin: 0, yMin: 0, xMax: 100, yMax: 100 },
        mesh: Array(468).fill([0, 0, 0]),
        scaledMesh: Array(468).fill([0, 0, 0])
    }])
});
mockFaceLandmarksDetection.SupportedPackages = {
    mediapipeFacemesh: 'mediapipeFacemesh'
};
global.faceLandmarksDetection = mockFaceLandmarksDetection;

// Mock document and URL for share tests
const mockDocument = {
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
            style: {},
            toBlob: jest.fn((callback) => {
                callback(new Blob(['mock-image-data'], { type: 'image/png' }));
            }),
            getContext: jest.fn(() => ({
                drawImage: jest.fn()
            }))
        };
    })
};
global.document = mockDocument;

global.URL = {
    createObjectURL: jest.fn(() => 'blob://mock-url'),
    revokeObjectURL: jest.fn()
};

// Make the mock document available for tests
global.mockDocument = mockDocument;

// Mock canvas API
class MockCanvas {
    constructor() {
        this.toBlob = jest.fn((callback) => {
            callback(new Blob(['mock-image-data'], { type: 'image/png' }));
        });
        this.getContext = jest.fn(() => ({
            drawImage: jest.fn()
        }));
    }
}
global.HTMLCanvasElement = MockCanvas;
