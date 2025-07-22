# Master Task List

This file consolidates tasks and checklists from across the repository, combining items from `TASKS.md`, `build/1.md`, `build/2.md`, and `build/4.md`.

## Environment & Tooling Setup (build/2.md)
- Node.js & npm (v16+ recommended)
- Vite for dev server and bundling
- Vercel CLI for one‑command deploys

## Key Dependencies (build/2.md)
- three – 3D engine & WebGL abstraction
- @tensorflow-models/facemesh or face-api.js for automatic face crop
- cropperjs for user‑draggable crop UI
- dat.gui (or lil-gui) for sliders and controls
- html2canvas to capture canvas for download/share
- stats.js for FPS monitoring during development
- vercel (CLI) as a dev dependency

## Project Structure & Config Files (build/2.md)
- Establish directories (`public/`, `src/`, `utils/`, `ui/`, `assets/`)
- Configure `package.json` scripts for dev, build and deploy
- Set up `vite.config.js` and `vercel.json`

## Core Source Files (build/2.md)
- Implement `src/index.html` with file input and Three.js canvas
- Create `src/styles.css` with full‑screen canvas and UI layout
- Build `src/main.js` to orchestrate loading, face detection, mesh creation and GUI
- Provide utilities: `faceDetection.js`, `meshDeformer.js`, `share.js`
- Build UI modules: `cropperUI.js`, `controlsUI.js`

## Putting It All Together (build/2.md)
- `npm run dev` for local development
- `npm run build` to produce a production bundle
- `npm run deploy` to host via Vercel

### Optional Extras & Testing (build/2.md)
- TypeScript support with `tsconfig.json`
- Unit tests for mesh math (Jest)
- CI/CD via GitHub Actions
- Performance tweaks such as simplified meshes on mobile

## Feature Roadmap (build/1.md)
- Automatic Face‑Crop with TensorFlow.js or face-api.js, falling back to manual cropper
- Configurable “N64 Mode” toggling low‑poly vs HD meshes
- Brush & Physics presets (e.g. Soft, Bouncy, Stiff)
- Save & Share using a permalink and OpenGraph preview
- PWA Support with manifest and service worker

### Performance & Stability (build/1.md)
- Web Worker for spring physics
- WASM proof‑of‑concept for faster engine
- Adaptive quality based on device performance
- Analytics & error tracking via services like Plausible or Sentry

### Development Workflow (build/1.md)
- Maintain GitHub repo
- Add CI with linting and smoke tests
- Use `main` for production and a `dev` branch for staging

### Deployment Steps (build/1.md)
- Connect project to Vercel
- Configure framework, build command and output directory
- Optional environment variables
- Custom domain configuration
- Automatic deploys on push to `main`

### Maintenance & Monitoring (build/1.md)
- Uptime monitoring with Pingdom or UptimeRobot
- Performance budgets using Lighthouse in CI
- Feedback loop via “Report a problem” link
- Finalize build, push to GitHub and import into Vercel
- Iterate on analytics and error tracking

## Build Step 4 To‑Do Items (build/4.md)
### Face Detection & Cropping
- [ ] Improve workflow so detection runs automatically after upload
- [ ] Show a loading indicator during face detection
- [ ] Ensure cropped region stays centered

### Mesh Generation & Mapping
- [ ] Map the cropped face as a texture on the mesh
- [ ] Optionally use a hemisphere or curved mesh
- [ ] Ensure mesh aspect ratio matches the crop

### Interactive Dragging
- [ ] Make vertices draggable only near grab points
- [ ] Add visual indicators for draggable points
- [ ] Allow dragging with smooth deformation and spring‑back
- [ ] Add a reset button for the mesh

### UI/UX Improvements
- [ ] Hide upload/crop UI once mesh exists; show a re‑upload button
- [ ] Loading spinner or progress bar during detection and mesh creation
- [ ] Tooltips or short instructions for first‑time users

### Polish & Stretch Goals
- [ ] Toggle between N64 Mode and HD Mode
- [ ] Save/share stretched face
- [ ] PWA support for offline use
- [ ] Analytics/error tracking

## Ongoing Tasks from `TASKS.md`
### Testing & Quality
- [ ] Comprehensive Playwright e2e coverage across desktop and mobile browsers
- [ ] Visual regression tests for canvas output
- [ ] Offload spring physics to a Web Worker
- [ ] Automated Lighthouse checks and performance budgets in CI
- [ ] Error and analytics tracking (Sentry or Plausible)

### Deployment & CI
- [ ] Preview deployments for pull requests
- [ ] Documentation on custom domains and environment variables

### Stretch Goals
- [ ] Webcam capture as an alternative to file upload
- [ ] Export animations (GIF/MP4) of the stretching process
- [ ] Localized UI text for multiple languages
- [ ] Preset faces with save/load editing sessions

Already completed items in `TASKS.md` cover core features like image upload, automatic face detection, manual crop fallback, mesh generation, interactive deformation, reset button, save/share, keyboard and pointer controls, Mario‑style cursor, share links, lockable deformations, hemisphere mesh, brush & physics controls, camera controls, first‑time instructions overlay, PWA support, service worker caching, mobile layout improvements, accessibility polish and dark mode.
