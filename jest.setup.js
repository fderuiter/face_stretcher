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
        const positions = new Float32Array(300);
        for (let i = 0; i < 100; i++) {
            positions[i * 3] = Math.random();
            positions[i * 3 + 1] = Math.random();
            positions[i * 3 + 2] = Math.random();
        }
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
            geometry: {
                attributes: {
                    position: {
                        count: 100,
                        array: positions,
                        needsUpdate: false
                    }
                },
                dispose: jest.fn()
            },
            material: {
                dispose: jest.fn(),
                map: {
                    dispose: jest.fn()
                }
            }
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

// Mock TensorFlow faceLandmarksDetection
const faceLandmarksDetection = function() {};
faceLandmarksDetection.load = jest.fn().mockResolvedValue({
    estimateFaces: jest.fn().mockImplementation(async () => [{
        box: { xMin: 0, yMin: 0, xMax: 100, yMax: 100 },
        mesh: Array(468).fill([0, 0, 0]),
        scaledMesh: Array(468).fill([0, 0, 0])
    }])
});
faceLandmarksDetection.SupportedPackages = {
    mediapipeFacemesh: 'mediapipeFacemesh'
};

// Make the mock spyable
Object.defineProperty(global, 'faceLandmarksDetection', {
    value: faceLandmarksDetection,
    writable: true,
    configurable: true
});

// Mock document and canvas API
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

const mockDocument = {
    createElement: jest.fn((type) => {
        if (type === 'a') {
            const element = {
                setAttribute: jest.fn(),
                click: jest.fn(),
                style: {},
                href: '',
                download: ''
            };
            return element;
        }
        const canvas = new MockCanvas();
        Object.setPrototypeOf(canvas, MockCanvas.prototype);
        return canvas;
    })
};

global.document = mockDocument;
global.mockDocument = mockDocument;
global.HTMLCanvasElement = MockCanvas;

// Mock URL API
global.URL = {
    createObjectURL: jest.fn(() => 'blob://mock-url'),
    revokeObjectURL: jest.fn()
};
