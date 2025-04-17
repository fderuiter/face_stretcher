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
  return new Promise((resolve) => {
    currentResolve = resolve;

    if (forceManual && currentFile) {
      // If forcing manual crop and we have a file, reuse it
      setupCropper(URL.createObjectURL(currentFile));
    } else {
      // Normal flow: wait for file input
      uploadInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          currentFile = file; // Store the selected file
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img); // Resolve with the full image for face detection first
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
      // Trigger file input if needed (e.g., if re-upload button was clicked)
      // uploadInput.click(); // Consider if this is the desired UX
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
        imgElement.src = cropperImage.src; // Use the source that was loaded into cropper
      }
    };

    reuploadButton.onclick = () => {
      hideCropper();
      uploadInput.value = ''; // Clear the input
      document.getElementById('upload-container').classList.remove('hidden'); // Show upload container again
      // Potentially trigger click or let user click again
      // uploadInput.click();
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
                    // Potentially resolve a promise here if needed for timeout
                },
            });
        } catch (cropperError) {
            console.error("Error initializing Cropper.js:", cropperError);
            // Handle cropper initialization error (e.g., show message, reject promise)
            if (currentResolve) {
                // We need a way to reject the promise from main.js
                // For now, just log and maybe alert
                alert("Failed to initialize the image cropper.");
                // Consider calling hideCropper() or similar cleanup
            }
        }
    };
    cropperImage.onerror = () => {
        console.error("cropperImage failed to load src:", imageSrc);
        alert("Failed to load the image for cropping.");
        // Handle image load error
    };

    console.log("Setting cropperImage.src");
    cropperImage.src = imageSrc;

  } catch (error) {
    console.error("Error in setupCropper function:", error);
    alert("An unexpected error occurred while setting up the cropper.");
    // Handle general error
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
