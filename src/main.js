const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('face-canvas');
const ctx = canvas.getContext('2d');

let originalImageData = null;
let dragging = false;
let startPos = { x: 0, y: 0 };
const brushRadius = 80;

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  img.src = URL.createObjectURL(file);
});

canvas.addEventListener('mousedown', (e) => {
  if (!originalImageData) return;
  const rect = canvas.getBoundingClientRect();
  startPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  dragging = true;
});

canvas.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  const dx = currentPos.x - startPos.x;
  const dy = currentPos.y - startPos.y;
  applyWarp(dx, dy);
});

canvas.addEventListener('mouseup', () => {
  if (dragging) {
    // commit the warp
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  dragging = false;
});

function applyWarp(dx, dy) {
  const width = canvas.width;
  const height = canvas.height;
  const src = originalImageData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dist = Math.hypot(x - startPos.x, y - startPos.y);
      if (dist < brushRadius) {
        const falloff = 1 - dist / brushRadius;
        const sx = Math.round(x - dx * falloff);
        const sy = Math.round(y - dy * falloff);
        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const sIdx = (sy * width + sx) * 4;
          dst[idx] = src[sIdx];
          dst[idx + 1] = src[sIdx + 1];
          dst[idx + 2] = src[sIdx + 2];
          dst[idx + 3] = src[sIdx + 3];
        } else {
          dst[idx] = dst[idx + 1] = dst[idx + 2] = 0;
          dst[idx + 3] = 0;
        }
      } else {
        dst[idx] = src[idx];
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = src[idx + 2];
        dst[idx + 3] = src[idx + 3];
      }
    }
  }

  ctx.putImageData(output, 0, 0);
}
