import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { loadAndValidateImage } from '../utils/imageValidation.js';

const uploadInput = document.getElementById('upload');
const cropperContainer = document.getElementById('cropper-container');
const cropperImage = document.getElementById('cropper-image');
const useCropButton = document.getElementById('use-crop');
const reuploadButton = document.getElementById('reupload');

let cropperInstance = null;
let currentResolve = null;
let currentFile = null;

/**
 * Shows the cropper UI.
 * @param {boolean} forceManual - If true, skips the initial file selection and uses the existing image.
 * @returns {Promise<HTMLImageElement | { imageElement: HTMLImageElement, cropData: { x: number, y: number, width: number, height: number } }>} 
 */
export function showCropper(forceManual = false, file = null) {
  return new Promise((resolve, reject) => {
    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }
    
    currentResolve = resolve;

    if (file) {
      // Handle directly provided file (e.g. drag & drop)
      loadAndValidateImage(file)
        .then(validatedImage => {
          currentFile = file;
          if (forceManual) {
            setupCropper(validatedImage.src).catch(reject);
          } else {
            resolve(validatedImage);
          }
        })
        .catch(err => {
          console.error('Image validation failed:', err);
          alert(err.message);
          reject(err);
        });
    } else if (forceManual && currentFile) {
      try {
        const objectUrl = URL.createObjectURL(currentFile);
        setupCropper(objectUrl).catch(err => {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        });
      } catch (err) {
        console.error(`[ERR_CR_002] Cropper setup error: ${err.message}`);
        reject(new Error(`[ERR_CR_002] Cropper setup error: ${err.message}`));
      }
    } else {
      uploadInput.value = ''; // Clear the input
      uploadInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            // Validate and load the image
            const validatedImage = await loadAndValidateImage(file);
            currentFile = file;
            if (forceManual) {
              setupCropper(validatedImage.src);
            } else {
              resolve(validatedImage);
            }
          } catch (error) {
            console.error("Image validation failed:", error);
            alert(error.message); // Show user-friendly error
            reject(error);
          }
        }
      };
      uploadInput.click();
    }

    useCropButton.onclick = () => {
      if (!cropperInstance || !currentResolve) {
        console.error('[ERR_CR_006] Cropper not properly initialized');
        return;
      }
      
      try {
        const cropData = cropperInstance.getData(true);
        const imgElement = new Image();
        imgElement.onload = () => {
          currentResolve({ imageElement: imgElement, cropData });
          currentResolve = null;
        };
        imgElement.onerror = () => {
          reject(new Error('[ERR_CR_007] Failed to load cropped image'));
        };
        imgElement.src = cropperImage.src;
      } catch (error) {
        console.error(`[ERR_CR_008] Error during crop confirmation: ${error.message}`);
        reject(error);
      }
    };

    reuploadButton.onclick = () => {
      hideCropper();
      uploadInput.value = '';
      document.getElementById('upload-container').classList.remove('hidden');
    };
  });
}

function setupCropper(imageSrc) {
  return new Promise((resolve, reject) => {
    console.log("Setting up cropper with source:", imageSrc);
    
    const cleanup = () => {
      if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
      }
    };

    cropperImage.onload = () => {
      console.log("Cropper image loaded successfully");
      cleanup();
      
      try {
        cropperContainer.classList.remove('hidden');
        cropperInstance = new Cropper(cropperImage, {
          aspectRatio: 0,
          viewMode: 1,
          autoCropArea: 0.8,
          responsive: true,
          checkOrientation: false,
          ready() {
            console.log("Cropper.js initialized successfully");
            resolve();
          }
        });
      } catch (error) {
        console.error(`[ERR_CR_003] Cropper.js init failed: ${error.message}`);
        cleanup();
        reject(new Error(`[ERR_CR_003] Cropper.js init failed: ${error.message}`));
      }
    };

    cropperImage.onerror = () => {
      console.error(`[ERR_CR_004] Cropper image load error: ${imageSrc}`);
      cleanup();
      reject(new Error(`[ERR_CR_004] Cropper image load error: ${imageSrc}`));
    };

    cropperImage.src = imageSrc;
  });
}

export function hideCropper() {
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
  cropperContainer.classList.add('hidden');
  if (currentResolve) {
    currentResolve(null);
    currentResolve = null;
  }
}
