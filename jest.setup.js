require('@testing-library/jest-dom');

// Mock Three.js
jest.mock('three', () => ({
    WebGLRenderer: jest.fn(),
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    PlaneGeometry: jest.fn(() => {
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
    MeshBasicMaterial: jest.fn(() => ({
        dispose: jest.fn(),
        map: {
            dispose: jest.fn()
        }
    })),
    Mesh: jest.fn(() => {
        let positions = new Float32Array(300);
        for (let i = 0; i < 100; i++) {
            positions[i * 3] = i / 100;
            positions[i * 3 + 1] = Math.sin(i / 10);
            positions[i * 3 + 2] = Math.cos(i / 10);
        }
        return {
            position: { set: jest.fn() },
            scale: { set: jest.fn() },
            rotation: { set: jest.fn() },
            userData: {
                radius: 0.3,
                strength: 1.0,
                kStiff: 8,
                damping: 4,
                originalPositions: positions.slice()
            },
            geometry: {
                attributes: {
                    position: {
                        count: 100,
                        array: positions,
                        needsUpdate: false,
                        set original(val) {
                            positions = val;
                        },
                        get original() {
                            return positions;
                        }
                    }
                },
                dispose: jest.fn()
            },
            material: {
                dispose: jest.fn(),
                map: {
                    dispose: jest.fn()
                }
            },
            clone: jest.fn()
        };
    }),
    Vector2: jest.fn(() => ({
        x: 0,
        y: 0,
        subVectors: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis()
    })),
    Vector3: jest.fn(() => {
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
            distanceTo: jest.fn((v) => Math.sqrt(
                Math.pow(vec.x - v.x, 2) +
                Math.pow(vec.y - v.y, 2) +
                Math.pow(vec.z - v.z, 2)
            )),
            clone: jest.fn(() => ({
                x: vec.x,
                y: vec.y,
                z: vec.z,
                subVectors: vec.subVectors,
                multiplyScalar: vec.multiplyScalar,
                length: vec.length,
                normalize: vec.normalize,
                fromArray: vec.fromArray,
                distanceTo: vec.distanceTo,
                clone: vec.clone,
                copy: vec.copy,
                add: vec.add,
                toArray: vec.toArray
            })),
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

// Mock @tensorflow-models/face-landmarks-detection
const mockEstimateFaces = jest.fn().mockResolvedValue([{
    box: { xMin: 0, yMin: 0, xMax: 100, yMax: 100 },
    mesh: Array(468).fill([0, 0, 0]),
    scaledMesh: Array(468).fill([0, 0, 0])
}]);

const mockFaceLandmarksDetection = function() {
    return {
        estimateFaces: mockEstimateFaces
    };
};

mockFaceLandmarksDetection.load = jest.fn().mockImplementation(async () => ({
    estimateFaces: mockEstimateFaces
}));

mockFaceLandmarksDetection.SupportedPackages = {
    mediapipeFacemesh: 'mediapipeFacemesh'
};

jest.mock('@tensorflow-models/face-landmarks-detection', () => mockFaceLandmarksDetection);

// Set up global mocks
global.faceLandmarksDetection = mockFaceLandmarksDetection;
global.mockEstimateFaces = mockEstimateFaces;

// Mock document and canvas API
class MockCanvas {
    constructor() {
        this.toBlob = jest.fn((callback) => {
            const blob = new Blob(['mock-image-data'], { type: 'image/png' });
            callback(blob);
        });
        this.getContext = jest.fn(() => ({
            drawImage: jest.fn()
        }));
        this.width = 100;
        this.height = 100;
        this.style = {};
    }
}

const mockDocument = {
    createElement: jest.fn((type) => {
        if (type === 'a') {
            const element = {
                setAttribute: jest.fn(),
                click: jest.fn(),
                style: {},
                href: '',
                download: '',
                toString: () => '[object HTMLAnchorElement]'
            };
            return element;
        }
        const canvas = new MockCanvas();
        Object.setPrototypeOf(canvas, MockCanvas.prototype);
        canvas.toString = () => '[object HTMLCanvasElement]';
        return canvas;
    })
};

// Set up global mocks for document and canvas
global.document = mockDocument;
global.HTMLCanvasElement = MockCanvas;
global.HTMLImageElement = class {
    constructor() {
        this.width = 100;
        this.height = 100;
        this.naturalWidth = 100;
        this.naturalHeight = 100;
    }
};

// Mock URL API
global.URL = {
    createObjectURL: jest.fn(() => 'blob://mock-url'),
    revokeObjectURL: jest.fn()
};

// Mock File for image validation
global.File = class {
    constructor(parts, filename, options = {}) {
        this.name = filename;
        this.size = options.size || parts.reduce((total, part) => total + part.length, 0);
        this.type = options.type || '';
    }
};
