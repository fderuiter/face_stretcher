import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

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
 * @returns {Promise<HTMLImageElement | { imageElement: HTMLImageElement, cropData: { x: number, y: number, width: number, height: number } }>} Resolves with the original image element after initial selection, or with the image element and crop data if confirming a manual crop.
 */
export function showCropper(forceManual = false) {
  return new Promise((resolve, reject) => {
     currentResolve = resolve;

     if (forceManual && currentFile) {
       // If forcing manual crop and we have a file, reuse it
       try {
         setupCropper(URL.createObjectURL(currentFile));
       } catch (err) {
         console.error(`[ERR_CR_002] Cropper setup error: ${err.message}`);
         reject(new Error(`[ERR_CR_002] Cropper setup error: ${err.message}`));
       }
     } else {
       // Normal flow: wait for file input
       uploadInput.onchange = (event) => {
         const file = event.target.files[0];
         if (file) {
           currentFile = file; // Store the selected file
           const reader = new FileReader();
           reader.onload = (e) => {
             const img = new Image();
             img.onload = () => resolve(img); // initial success
             img.src = e.target.result;
           };
           reader.onerror = () => {
             console.error(`[ERR_CR_001] File read error: ${reader.error?.message}`);
             reject(new Error(`[ERR_CR_001] File read error: ${reader.error?.message}`));
           };
           reader.readAsDataURL(file);
         }
       };
     }

    useCropButton.onclick = () => {
       if (cropperInstance && currentResolve) {
         const cropData = cropperInstance.getData(true); // Get rounded crop data
         const imgElement = new Image();
         imgElement.onload = () => {
             // Resolve with both the original image element and the crop data
             currentResolve({ imageElement: imgElement, cropData });
             currentResolve = null; // Prevent multiple resolves
         };
         imgElement.src = cropperImage.src;
       }
     };

     reuploadButton.onclick = () => {
       hideCropper();
       uploadInput.value = ''; // Clear the input
       document.getElementById('upload-container').classList.remove('hidden');
     };
   });
 }

function setupCropper(imageSrc) {
  console.log("setupCropper called with src:", imageSrc);
  try {
    cropperImage.onload = () => {
        console.log("cropperImage finished loading src");
        if (cropperInstance) {
            console.log("Destroying previous cropper instance.");
            cropperInstance.destroy();
            cropperInstance = null;
        }
        cropperContainer.classList.remove('hidden');
        console.log("Initializing Cropper.js...");
        try {
            cropperInstance = new Cropper(cropperImage, {
                aspectRatio: 0, // Free aspect ratio initially
                viewMode: 1, // Restrict crop box to canvas
                autoCropArea: 0.8,
                responsive: true,
                checkOrientation: false, // Avoid issues with EXIF data
                ready() {
                    console.log("Cropper.js is ready!");
                },
            });
        } catch (cropperError) {
            console.error(`[ERR_CR_003] Cropper.js init failed: ${cropperError.message}`);
            if (currentResolve) {
                reject(new Error(`[ERR_CR_003] Cropper.js init failed: ${cropperError.message}`));
                currentResolve = null;
            }
        }
    };
    cropperImage.onerror = () => {
        console.error(`[ERR_CR_004] Cropper image load error: ${imageSrc}`);
        reject(new Error(`[ERR_CR_004] Cropper image load error: ${imageSrc}`));
    };

    console.log("Setting cropperImage.src");
    cropperImage.src = imageSrc;

  } catch (error) {
    console.error(`[ERR_CR_000] Unexpected setupCropper error: ${error.message}`);
    reject(new Error(`[ERR_CR_000] Unexpected setupCropper error: ${error.message}`));
  }
}

export function hideCropper() {
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
  cropperContainer.classList.add('hidden');
  // Don't hide the main upload container here, main.js controls that
}
