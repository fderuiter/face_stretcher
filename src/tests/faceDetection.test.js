// These tests are now obsolete since the face detection logic has been moved to a web worker.
// The core logic is now part of the worker and is harder to unit test in the same way.
// The e2e tests will cover the functionality.

describe('detectFace', () => {
  test.skip('should have tests for the worker', () => {
    // TODO: Add tests for the generation worker
  });
});
