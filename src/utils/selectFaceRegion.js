import { detectFace } from './faceDetection.js';
import { showCropper } from '../ui/cropperUI.js';

// Error codes:
// ERR_SR_001: Manual crop cancelled

/**
 * Attempts to detect the face region in the provided image. If detection fails,
 * shows the manual cropper UI so the user can select the region themselves.
 * @param {HTMLImageElement} image Loaded image element
 * @param {File|null} file Original file for manual cropper
 * @returns {Promise<{image: HTMLImageElement, bbox: {x:number,y:number,width:number,height:number}}>} result
 */
export async function selectFaceRegion(image, file = null) {
  try {
    const bbox = await detectFace(image);
    return { image, bbox };
  } catch (err) {
    const manual = await showCropper(true, file);
    if (!manual) {
      throw new Error('[ERR_SR_001] Manual crop cancelled');
    }
    return { image: manual.imageElement, bbox: manual.cropData };
  }
}
