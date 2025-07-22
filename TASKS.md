# Project Task List

This document outlines the remaining work needed to turn this proof of concept into a polished "Mario 64" style face stretching app. The goal is for a user to upload a photo of their own face and interactively stretch it just like the original Nintendo 64 intro.
This document tracks current and upcoming work for the Mario‑style face stretching app. Items with a check mark are already implemented.

## Core Features

- [x] **Image Upload & Validation** – allow users to upload JPEG/PNG/WEBP images. Validate file type, size and dimensions.
- [x] **Automatic Face Detection** – run TensorFlow.js face detection on the uploaded image and suggest a crop around the face.
- [x] **Manual Crop Fallback** – provide a cropper UI when detection fails so users can select the face region themselves.
- [x] **Mesh Generation** – map the cropped face onto a deformable mesh. Support both a low‑poly "N64" mode and a smoother high‑res mode.
- [x] **Interactive Deformation** – click or touch to grab points on the mesh and drag them around. Vertices should spring back when released.
- [x] **Reset Button** – instantly restore the mesh to its original state.
- [x] **Save/Share** – capture the canvas to an image so users can download or share their creations.
- [x] **Keyboard Controls** – support keyboard mappings for cursor movement, grabbing, zoom and rotation as listed in the README.
- [x] **Pointer Controls** – allow manipulation via the mouse and clicks in addition to the keyboard.
- [x] **Mario-style Cursor** – show a white glove cursor over the canvas for added nostalgia.

## Polishing & UX

- [x] **Image Upload & Validation** – drag/drop support and checks for JPEG/PNG/WEBP up to 10MB.
- [x] **Automatic Face Detection** – suggest a crop around the detected face using TensorFlow.js.
- [x] **Manual Crop Fallback** – present a cropper UI if detection fails.
- [x] **Mesh Generation** – build a deformable mesh in both classic low‑poly “N64 Mode” and smoother HD mode.
- [x] **Interactive Deformation** – manipulate the mesh with mouse, touch or keyboard. Vertices spring back when released.
- [x] **Reset Button** – instantly restore the original mesh state.
- [x] **Save Image** – capture the canvas to a PNG for download.
- [x] **Keyboard Controls** – arrow keys for movement, A/R/B/I/J/K/L and Enter to mimic N64 actions.
- [x] **Mario‑Style Cursor** – white glove pointer for nostalgia.
- [x] **Pointer Controls** – click and drag with the mouse to deform the face.
- [x] **Share Links** – generate a permalink so finished faces can be re‑loaded or shared on social media.
- [x] **Lockable Deformations** – support holding A + R to pin vertices in place just like the original game.

## Graphics & Interaction

- [x] **Grab Points** – snap the cursor to nose, cheeks, hat brim and other key regions for easier stretching.
- [x] **Hemisphere Mesh** – optionally map the face onto a curved surface for more depth.
- [x] **Brush & Physics Controls** – expose sliders for radius, strength, stiffness and damping.
- [x] **Camera Zoom & Rotation** – keyboard shortcuts for zoom levels and viewing angles.

## UI & UX

- [x] Loading indicators during face detection and mesh creation.
- [x] Simple instructions or tooltips for first‑time users.
- [x] Optionally package the app as a Progressive Web App so it can be installed and used offline.

- [x] Write unit tests for critical utilities such as face detection and mesh deformation.
- [x] Configure a CI workflow (GitHub Actions or similar) to run linting, tests and builds on every pull request.
- [x] Deploy automatically to a free hosting provider (e.g. Vercel) when the `main` branch updates.
- [x] Add Playwright end-to-end tests to validate the user flow.

This list should be reviewed and updated as development progresses.

- [x] First‑time instructions overlay.
- [x] Progressive Web App support so the tool works offline once installed.
- [x] Service worker caching of models and textures for a smoother offline experience.
- [x] Mobile layout improvements and touch‑friendly controls.
- [ ] Accessibility polish including ARIA labels and better focus states.
- [ ] Dark mode theme.

## Testing & Quality

- [x] Unit tests for key utilities and UI helpers.
- [ ] Playwright end‑to-end tests.
- [ ] **Comprehensive Playwright e2e coverage across desktop and mobile browsers.**
- [ ] Visual regression tests for the canvas output.
- [ ] Offload spring physics to a Web Worker for better performance on low‑end devices.
- [ ] Automated Lighthouse checks and performance budgets in CI.
- [ ] Error and analytics tracking (e.g. Sentry or Plausible).

## Deployment & CI

- [x] GitHub Actions workflow for linting, tests and builds.
- [x] Automatic deployment to Vercel on every push to `main`.
- [ ] Preview deployments for pull requests.
- [ ] Documentation for configuring custom domains and environment variables.

## Stretch Goals

- [ ] Webcam capture as an alternative to file upload.
- [ ] Export animations (GIF/MP4) of the stretching process.
- [ ] Localized UI text for multiple languages.
- [ ] Preset faces and the ability to save/load editing sessions.

This list should be reviewed regularly as development continues.
