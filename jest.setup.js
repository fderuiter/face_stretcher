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
    })),
    Mesh: jest.fn(() => ({
        position: { set: jest.fn() },
        scale: { set: jest.fn() },
        rotation: { set: jest.fn() }
    })),
    Vector2: jest.fn(() => ({ x: 0, y: 0 })),
    Vector3: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
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
jest.mock('@tensorflow-models/face-landmarks-detection', () => ({
    load: jest.fn(),
    SupportedPackages: {
        mediapipeFacemesh: 'mediapipeFacemesh'
    }
}));
