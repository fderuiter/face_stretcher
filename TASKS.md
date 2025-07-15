# Project Task List

This document outlines the remaining work needed to turn this proof of concept into a polished "Mario 64" style face stretching app. The goal is for a user to upload a photo of their own face and interactively stretch it just like the original Nintendo 64 intro.

## Core Features

- [x] **Image Upload & Validation** – allow users to upload JPEG/PNG/WEBP images. Validate file type, size and dimensions.
- [x] **Automatic Face Detection** – run TensorFlow.js face detection on the uploaded image and suggest a crop around the face.
- [x] **Manual Crop Fallback** – provide a cropper UI when detection fails so users can select the face region themselves.
- [ ] **Mesh Generation** – map the cropped face onto a deformable mesh. Support both a low‑poly "N64" mode and a smoother high‑res mode.
- [ ] **Interactive Deformation** – click or touch to grab points on the mesh and drag them around. Vertices should spring back when released.
- [ ] **Reset Button** – instantly restore the mesh to its original state.
- [ ] **Save/Share** – capture the canvas to an image so users can download or share their creations.
- [ ] **Keyboard Controls** – support keyboard mappings for cursor movement, grabbing, zoom and rotation as listed in the README.

## Polishing & UX

- [ ] Loading indicators during face detection and mesh creation.
- [ ] Simple instructions or tooltips for first‑time users.
- [ ] Optionally package the app as a Progressive Web App so it can be installed and used offline.

## Development Workflow

- [ ] Write unit tests for critical utilities such as face detection and mesh deformation.
- [ ] Configure a CI workflow (GitHub Actions or similar) to run linting, tests and builds on every pull request.
- [ ] Deploy automatically to a free hosting provider (e.g. Vercel) when the `main` branch updates.

This list should be reviewed and updated as development progresses.
