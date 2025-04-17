require('@testing-library/jest-dom');

// Mock Three.js
jest.mock('three', () => ({
    WebGLRenderer: jest.fn(),
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    PlaneGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn(),
    Vector2: jest.fn(),
    Vector3: jest.fn(),
    Raycaster: jest.fn(),
    CanvasTexture: jest.fn(),
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
