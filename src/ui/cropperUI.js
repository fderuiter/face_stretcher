import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const uploadEl = document.getElementById('upload');
const cropperContainer = document.getElementById('cropper-container');
const cropperImage     = document.getElementById('cropper-image');
const useBtn           = document.getElementById('use-crop');
const reupBtn          = document.getElementById('reupload');

let resolveCrop;
let cropper;

/**
 * Show file picker + Cropper.js. Returns a Promise<HTMLCanvasElement>
 */
export function showCropper() {
  return new Promise(res => {
    resolveCrop = res;
    uploadEl.onchange = () => {
      const file = uploadEl.files[0];
      const url  = URL.createObjectURL(file);
      cropperImage.src = url;
      cropperContainer.classList.remove('hidden');
      cropper = new Cropper(cropperImage, { viewMode: 1, autoCropArea: 1 });
    };
    uploadEl.click();
  });
}

useBtn.addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas();
  cropper.destroy();
  cropperContainer.classList.add('hidden');
  resolveCrop(canvas);
});

reupBtn.addEventListener('click', () => {
  cropper.destroy();
  cropperContainer.classList.add('hidden');
  showCropper().then(resolveCrop);
});

export function hideCropper() {
  cropperContainer.classList.add('hidden');
}
