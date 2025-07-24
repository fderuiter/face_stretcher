# Master Task List

This file consolidates every task and checklist found across the repository. Items retain their original wording and completion status.

## Build Step 2 – Project Setup and Modules

### Environment & Tooling
- **Node.js & npm** (v16+ recommended)
- **Vite** (for fast bundling/dev server)
- **Vercel CLI** (for one‑command deploys)

### Key Dependencies
- `three` – 3D engine & WebGL abstraction
- `@tensorflow-models/facemesh` (or `face-api.js`) for automatic face bounding‑box/crop
- `cropperjs` – user‑draggable crop UI
- `dat.gui` (or `lil-gui`) – sliders & controls UI
- `html2canvas` – capture canvas for download/share
- `stats.js` (optional) – FPS / performance monitoring during dev
- `vercel` (CLI, dev dependency) – deploy to Vercel

### Project Structure
```
stretchy-face-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── utils/
│   │   ├── faceDetection.js
│   │   ├── meshDeformer.js
│   │   └── share.js
│   ├── ui/
│   │   ├── cropperUI.js
│   │   └── controlsUI.js
│   └── assets/
│       └── placeholder.jpg
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json
```

### Config Files
- `package.json` with scripts `dev`, `build` and `deploy`
- `vite.config.js` defining the build output directory
- `vercel.json` with static build rules

### Core Source Files
- `src/index.html` – file input, drag‑drop area and `<canvas id="c">`
- `src/styles.css` – full‑screen canvas and UI layout
- `src/main.js` – orchestrates loading, face detection, mesh creation and GUI
- `src/utils/faceDetection.js` – load facemesh/face‑api and return crop bounds
- `src/ui/cropperUI.js` – wraps a `<canvas>` plus `cropperjs`, returns cropped canvas
- `src/utils/meshDeformer.js` – create mesh, stretch regions, update springs
- `src/ui/controlsUI.js` – GUI panel with sliders and buttons
- `src/utils/share.js` – capture canvas and trigger download/share

### Putting It All Together
1. `npm run dev` and open `http://localhost:5173`
2. `npm run build` to create the `dist/` directory
3. `npm run deploy` to publish via Vercel

### Optional Extras & Testing
- TypeScript with `tsconfig.json`
- Unit Tests for `meshDeformer` math
- CI/CD via GitHub Actions
- Performance tweaks like simplified meshes on mobile

## Build Step 1 – Feature Roadmap

### UX & Polish
1. **Automatic Face‑Crop**
   - Integrate TensorFlow.js FaceMesh or face‑api.js to auto‑detect and center the face on upload.
   - Fall back to manual cropper only if detection fails.
2. **Configurable “N64 Mode”**
   - Toggle between retro (low‑poly, nearest‑filter, 128×128 texture) and HD (higher subdivisions, linear‑filter, 512×512)
3. **Brush & Physics Presets**
   - Let users pick “Soft,” “Bouncy,” “Stiff” or even custom sliders.
4. **Save & Share**
   - Generate a permalink (via a free serverless function) that re‑loads your exact stretched state.
   - Social‑media meta tags + OpenGraph image preview.
5. **PWA Support**
   - Add a `manifest.json` and service worker so it “installs” on mobile and works offline once loaded.

### Performance & Stability
1. **Web Worker for Physics** – move `updateSprings()` into a worker thread to keep 60 FPS when dragging hard.
2. **WASM Proof‑of‑Concept** – swap in a Rust/WASM spring simulator for faster performance on low‑end devices.
3. **Adaptive Quality** – detect device performance and lower segment count or texture resolution automatically.
4. **Analytics & Error‑Tracking** – integrate Plausible or Google Analytics and add Sentry for capturing JS errors.

### Development Workflow
1. **GitHub Repo** – push all code to GitHub.
2. **Continuous Integration** – add a GitHub Actions workflow to lint/format and smoke‑test every PR.
3. **Branching Model** – `main` deploys production; `dev` branch for staging.

### Deployment Steps (Vercel Example)
1. **Connect to GitHub** – import the repo in Vercel.
2. **Configure** – framework: Other (Vite); build command `npm run build`; output dir `dist/`.
3. **Environment Variables** – none needed for client‑side.
4. **Custom Domain** – use your own domain or `your-app.vercel.app`.
5. **Automatic Deploys** – every push to `main` triggers production.

### Maintenance & Monitoring
- **Uptime Status** with Pingdom or UptimeRobot
- **Performance Budgets** using Lighthouse in CI
- **Feedback Loop** via a “Report a problem” link
- Finalize build, push to GitHub and import into Vercel
- Iterate on analytics and error tracking

## Build Step 4 – To‑Do List for Mario 64-Style Face Stretcher
### 1. Face Detection & Cropping
- [x] Improve workflow so face detection runs automatically after upload, and only falls back to manual crop if detection fails.
- [x] Show a loading indicator while face detection is running.
- [x] Ensure the cropped region is always centered on the detected face.

### 2. Mesh Generation & Mapping
- [x] Map the cropped face image as a texture onto the mesh (currently a flat plane).
- [x] (Optional) Switch to a hemisphere or slightly curved mesh for a more 3D effect, like Mario 64.
- [x] Ensure mesh aspect ratio matches the cropped face region.

### 3. Interactive Dragging (Mario 64 Style)
 - [x] Make mesh vertices draggable only when pointer is near them (like Mario 64's "grab points").
 - [x] Add visual indicators (dots or handles) for draggable points (corners, mouth, cheeks, etc.).
  - [x] Allow user to drag these points and have the mesh smoothly deform and spring back.
  - [x] Add a "reset" button to snap the mesh back to its original state.

### 4. UI/UX Improvements
 - [x] Hide upload/crop UI after mesh is generated; show a "re-upload" button somewhere non-intrusive.
- [x] Add a loading spinner or progress bar during face detection and mesh generation.
- [x] Add tooltips or short instructions for first-time users.

### 5. Polish & Stretch Goals
- [x] Add a toggle for "N64 Mode" (low-poly, pixelated texture) vs. "HD Mode" (high-res, smooth mesh).
- [x] Add ability to save/share the stretched face (already partially implemented).
- [x] Add PWA support for offline use.
- [x] Add analytics/error tracking (optional for production).

## Project Task List (from `TASKS.md`)

### Core Features
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
- [x] **Share Links** – generate a permalink so finished faces can be re‑loaded or shared on social media.
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
- [x] **Comprehensive Playwright e2e coverage across desktop and mobile browsers.**
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


### Backend Debugging & Error Handling
- [ ] Add health checks for WebGL and TensorFlow initialization.
- [ ] Display clear overlay messages when back-end components fail to load.
- [ ] Capture startup diagnostics for easier troubleshooting.
- [ ] Warn users when the browser lacks required features.
- [ ] Document blank-screen troubleshooting steps.
