# Face Stretcher POC

A lightweight proof of concept for a browser‑based face stretching tool using HTML5 Canvas and Vite. It lets you upload a photo and drag parts of the face just like the Mario 64 start screen. You can either click the upload area or drag a file onto it.

## Features

- Upload an image and manually stretch regions with a smooth falloff brush.
- Supports JPEG, PNG and WebP uploads up to 10MB with drag-and-drop convenience.
- Built with Vite for fast development and optimized production build.
- Automatically detects your face using TensorFlow.js and suggests a crop around your face. If detection fails, a manual cropper UI lets you select the region yourself.
- Toggle classic **N64 Mode** for a low-poly mesh or switch to a smoother high-res version.
- Optionally map the face onto a curved hemisphere for extra depth.
- Stretch the face interactively with mouse, touch, or the new keyboard controls.
- Dedicated pointer controls ensure smooth dragging on both mouse and touch devices.
- Fine-tune brush radius, strength and spring physics with handy sliders.
- Nostalgic Mario-style glove cursor over the canvas.
- Cursor snaps to grab-points like the nose, cheeks and hat brim for precise stretching.
- Hold **A** then press **R** to lock a deformation in place.
- Cycle through zoom levels with **B** and rotate the head using **I**, **J**, **K** and **L**.
- Click the dedicated **Reset** button at any time to snap the face back to its original shape.
- Save your creation as a PNG using the **Save Image** button.
- Copy a shareable link to your stretched face with the **Share Link** button. Opening that link reloads the same image.
- Visual loading indicators appear while the app detects your face and builds the mesh.
- Helpful instructions appear the first time you visit so you know how to get started.

### Mesh Generation

The cropped face is projected onto a Three.js mesh—either a flat plane or an optional hemisphere for added depth. In **N64 Mode** a
pixelated texture and just 10 segments recreate the low-poly look. Switch it off
for a smoother high-res mesh with linear filtering.

### Manual Crop Fallback

If automatic face detection fails, a drag-and-zoom cropper lets you manually select the face region before the mesh is generated.

## Getting Started

### Prerequisites

- Node.js 16+ installed

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the provided localhost URL in your browser.

### Production Build

```bash
npm run build
npm run serve
```

### Tests

```bash
npm test
```

## Keyboard Controls

The original Mario 64 intro relied on the N64 controller. This project mirrors those actions using the keyboard.

| Action                            | What to do                                                                      | Notes                                                                               | Sources                        |
| --------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| **Move the white-glove cursor**   | Use the **arrow keys** to move the cursor                                       | The cursor snaps to grab-points (hat brim, nose, cheeks, mustache, ears, chin).     | ([GameFAQs][1])                |
| **Grab & stretch**                | Hold **A** while the cursor is over a grab-point and use the arrow keys to pull | Release **A** to let vertices spring back.                                          | ([GameFAQs][1])                |
| **Lock a deformation**            | While holding **A**, press & hold **R**, then let go of **A**                   | The face freezes in that warped pose. You can pin multiple features this way.       | ([GameFAQs][2])                |
| **Unlock / snap everything back** | Release **R**                                                                   | There’s no penalty or limit.                                                        | ([GameFAQs][2])                |
| **Zoom levels**                   | Tap **B** to cycle through 3 head sizes: close-up, mid, far                     | At the farthest zoom you can drag features much farther—great for “mega-nose” gags. | ([GameFAQs][1], [GameFAQs][3]) |
| **Rotate the head**               | Use **I**, **J**, **K** and **L** for C-Up, C-Left, C-Down and C-Right          | Lets you examine your handiwork from any angle.                                     | ([GameFAQs][3])                |
| **Exit to the actual file menu**  | Press **Enter**                                                                 | The face pops back to normal and the save icons fade in.                            | ([GameFAQs][1])                |

Keyboard behavior is configurable via the options passed to [`initKeyboardControls`](./src/ui/keyboardControls.js), letting you adjust cursor step size and zoom levels.

[1]: https://gamefaqs.gamespot.com/n64/198848-super-mario-64/faqs/22000?utm_source=chatgpt.com "Super Mario 64 - Guide and Walkthrough - Nintendo 64 - By CWall"
[2]: https://gamefaqs.gamespot.com/n64/198848-super-mario-64/faqs/3326?utm_source=chatgpt.com "Super Mario 64 - Guide and Walkthrough - Nintendo 64 - GameFAQs"
[3]: https://gamefaqs.gamespot.com/boards/198848-super-mario-64/61015707?utm_source=chatgpt.com "I DIDN'T KNOW YOU COULD HOLD R TO KEEP MARIO'S FACE ..."

## Project Structure

```txt
├── index.html      # Entry point with canvas
├── src
│   ├── main.js     # Core application logic
│   └── style.css   # Basic UI styles
├── dist/           # Production output (ignored by git)
└── .gitignore      # Exclude node_modules, dist, etc.
```

## CI

This project includes a GitHub Actions workflow located at `.github/workflows/ci.yml`. The
workflow installs dependencies using `npm ci`, runs ESLint, executes the Jest test suite
and builds the production bundle on every push and pull request.

## Deployment
Deployments are handled by a separate GitHub Actions workflow defined in
`.github/workflows/deploy.yml`. Whenever code is pushed to the `main` branch the
workflow deploys the site to Vercel using the
[`amondnet/vercel-action`](https://github.com/amondnet/vercel-action)
action. To enable it, configure the following repository secrets in GitHub:

- `VERCEL_TOKEN` – your Vercel personal token
- `VERCEL_ORG_ID` – the organization ID from your Vercel dashboard
- `VERCEL_PROJECT_ID` – the project ID for this app

## Roadmap

See the files under `build/` for long term ideas and check `TASKS.md` for the current to‑do list.

---

© 2025 Your Name
