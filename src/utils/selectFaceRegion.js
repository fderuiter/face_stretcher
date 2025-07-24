import { detectFace } from "./faceDetection.js";
import { showCropper } from "../ui/cropperUI.js";
import { logError } from "./analytics.js";

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

    const imgW = image.naturalWidth || image.width;
    const imgH = image.naturalHeight || image.height;
    const size = Math.max(bbox.width, bbox.height);
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    let x = Math.round(centerX - size / 2);
    let y = Math.round(centerY - size / 2);
    x = Math.max(0, Math.min(x, imgW - size));
    y = Math.max(0, Math.min(y, imgH - size));
    const centeredBox = { x, y, width: size, height: size };

    return { image, bbox: centeredBox };
  } catch (err) {
    logError(err);
    const manual = await showCropper(true, file);
    if (!manual) {
      throw new Error("[ERR_SR_001] Manual crop cancelled");
    }
    return { image: manual.imageElement, bbox: manual.cropData };
  }
}
