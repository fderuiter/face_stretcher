# Master Task List

This consolidated list gathers tasks and checklists from across the project.
It merges items from `build/1.md`, `build/2.md`, `build/4.md` and the former
`TASKS.md` file.

## Build Step 2 – Environment and Tooling
- Node.js & npm (v16+ recommended)
- Vite for dev server and bundling
- Vercel CLI for one-command deploys

### Key Dependencies
- three – 3D engine & WebGL abstraction
- @tensorflow-models/facemesh or face-api.js for automatic face crop
- cropperjs for user-draggable crop UI
- dat.gui (or lil-gui) for sliders and controls
- html2canvas to capture canvas for download/share
- stats.js for FPS monitoring during development
- vercel (CLI) as a dev dependency

### Project Structure & Config Files
- Establish directories (`public/`, `src/`, `utils/`, `ui/`, `assets/`)
- Configure `package.json` scripts for dev, build and deploy
- Set up `vite.config.js` and `vercel.json`

### Core Source Files
- Implement `src/index.html` with file input and Three.js canvas
- Create `src/styles.css` with full-screen canvas and UI layout
- Build `src/main.js` to orchestrate loading, face detection, mesh creation and GUI
- Provide utilities: `faceDetection.js`, `meshDeformer.js`, `share.js`
- Build UI modules: `cropperUI.js`, `controlsUI.js`

### Putting It All Together
- `npm run dev` for local development
- `npm run build` to produce a production bundle
- `npm run deploy` to host via Vercel

### Optional Extras & Testing
- TypeScript support with `tsconfig.json`
- Unit tests for mesh math (Jest)
- CI/CD via GitHub Actions
- Performance tweaks such as simplified meshes on mobile

## Build Step 1 – Feature Roadmap
### UX & Polish
- Automatic Face-Crop using TensorFlow.js or face-api.js; fall back to manual cropper
- Configurable “N64 Mode” toggling low-poly vs HD meshes
- Brush & Physics presets such as Soft, Bouncy and Stiff
- Save & Share using a permalink and OpenGraph preview
- PWA support with a manifest and service worker

### Performance & Stability
- Web Worker for spring physics
- WASM proof-of-concept for faster engine
- Adaptive quality based on device performance
- Analytics and error tracking via services like Plausible or Sentry

### Development Workflow
- Maintain GitHub repo
- Add CI with linting and smoke tests
- Use `main` for production and a `dev` branch for staging

### Deployment Steps
- Connect project to Vercel
- Configure framework, build command and output directory
- Optional environment variables
- Custom domain configuration
- Automatic deploys on push to `main`

### Maintenance & Monitoring
- Uptime monitoring with Pingdom or UptimeRobot
- Performance budgets using Lighthouse in CI
- Feedback loop via “Report a problem” link
- Finalize build, push to GitHub and import into Vercel
- Iterate on analytics and error tracking

## Build Step 4 – To‑Do List
### Face Detection & Cropping
- [ ] Improve workflow so face detection runs automatically after upload, only falling back to manual crop if detection fails
- [ ] Show a loading indicator while face detection is running
- [ ] Ensure the cropped region is always centered on the detected face

### Mesh Generation & Mapping
- [ ] Map the cropped face image as a texture onto the mesh
- [ ] (Optional) Switch to a hemisphere or slightly curved mesh for a more 3D effect
- [ ] Ensure mesh aspect ratio matches the cropped face region

### Interactive Dragging (Mario 64 Style)
- [ ] Make mesh vertices draggable only when the pointer is near them (grab points)
- [ ] Add visual indicators for draggable points
- [ ] Allow dragging with smooth deformation and spring-back
- [ ] Add a reset button to snap the mesh back to its original state

### UI/UX Improvements
- [ ] Hide upload/crop UI after mesh is generated; show a re-upload button
- [ ] Add a loading spinner or progress bar during face detection and mesh creation
- [ ] Add tooltips or short instructions for first-time users

### Polish & Stretch Goals
- [ ] Toggle between N64 Mode and HD Mode
- [ ] Save/share the stretched face
- [ ] PWA support for offline use
- [ ] Analytics/error tracking

## Project Task List (from former `TASKS.md`)
### Core Features
- [x] **Image Upload & Validation** – allow users to upload JPEG/PNG/WEBP images. Validate file type, size and dimensions.
- [x] **Automatic Face Detection** – run TensorFlow.js face detection on the uploaded image and suggest a crop around the face.
- [x] **Manual Crop Fallback** – provide a cropper UI when detection fails so users can select the face region themselves.
- [x] **Mesh Generation** – map the cropped face onto a deformable mesh. Support both a low‑poly "N64" mode and a smoother high‑res mode.
- [x] **Interactive Deformation** – click or touch to grab points on the mesh and drag them around. Vertices spring back when released.
- [x] **Reset Button** – instantly restore the mesh to its original state.
- [x] **Save/Share** – capture the canvas to an image so users can download or share their creations.
- [x] **Keyboard Controls** – support keyboard mappings for cursor movement, grabbing, zoom and rotation as listed in the README.
- [x] **Pointer Controls** – allow manipulation via the mouse and clicks in addition to the keyboard.
- [x] **Mario-style Cursor** – show a white glove cursor over the canvas for added nostalgia.

### Polishing & UX
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
- [x] **Share Links** – generate a permalink so finished faces can be re-loaded or shared on social media.
- [x] **Lockable Deformations** – support holding A + R to pin vertices in place just like the original game.

### Graphics & Interaction
- [x] **Grab Points** – snap the cursor to nose, cheeks, hat brim and other key regions for easier stretching.
- [x] **Hemisphere Mesh** – optionally map the face onto a curved surface for more depth.
- [x] **Brush & Physics Controls** – expose sliders for radius, strength, stiffness and damping.
- [x] **Camera Zoom & Rotation** – keyboard shortcuts for zoom levels and viewing angles.

### UI & UX
- [x] Loading indicators during face detection and mesh creation.
- [x] Simple instructions or tooltips for first‑time users.
- [x] Optionally package the app as a Progressive Web App so it can be installed and used offline.
- [x] Write unit tests for critical utilities such as face detection and mesh deformation.
- [x] Configure a CI workflow (GitHub Actions or similar) to run linting, tests and builds on every pull request.
- [x] Deploy automatically to a free hosting provider (e.g. Vercel) when the `main` branch updates.
- [x] Add Playwright end-to-end tests to validate the user flow.
- [x] First‑time instructions overlay.
- [x] Progressive Web App support so the tool works offline once installed.
- [x] Service worker caching of models and textures for a smoother offline experience.
- [x] Mobile layout improvements and touch‑friendly controls.
- [x] Accessibility polish including ARIA labels and better focus states.
- [x] Dark mode theme.

### Testing & Quality
- [x] Unit tests for key utilities and UI helpers.
- [x] Playwright end‑to-end tests.
- [ ] **Comprehensive Playwright e2e coverage across desktop and mobile browsers.**
- [ ] Visual regression tests for the canvas output.
- [ ] Offload spring physics to a Web Worker for better performance on low‑end devices.
- [ ] Automated Lighthouse checks and performance budgets in CI.
- [ ] Error and analytics tracking (e.g. Sentry or Plausible).

### Deployment & CI
- [x] GitHub Actions workflow for linting, tests and builds.
- [x] Automatic deployment to Vercel on every push to `main`.
- [ ] Preview deployments for pull requests.
- [ ] Documentation for configuring custom domains and environment variables.

### Stretch Goals
- [ ] Webcam capture as an alternative to file upload.
- [ ] Export animations (GIF/MP4) of the stretching process.
- [ ] Localized UI text for multiple languages.
- [ ] Preset faces and the ability to save/load editing sessions.
