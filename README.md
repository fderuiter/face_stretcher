# Face Stretcher POC

A lightweight proof of concept for a browser‑based face stretching tool using HTML5 Canvas and Vite. It lets you upload a photo and drag parts of the face just like the Mario 64 start screen.

## Features

- Upload an image and manually stretch regions with a smooth falloff brush.
- Built with Vite for fast development and optimized production build.

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

Continuous integration has not been set up yet. The plan is to add a GitHub Actions workflow that runs linting, tests and a production build on every pull request.

## Roadmap

See the files under `build/` for long term ideas and check `TASKS.md` for the current to‑do list.

---

© 2025 Your Name
