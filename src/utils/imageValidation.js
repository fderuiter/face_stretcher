// Error codes:
// ERR_IV_001: Unsupported image format
// ERR_IV_002: Image dimensions too large
// ERR_IV_003: Image dimensions too small
// ERR_IV_004: File size too large
// ERR_IV_005: Image load error
// ERR_IV_006: Invalid image data

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 4096;

/**
 * Validates image file and dimensions
 * @param {File} file Image file to validate
 * @param {Object} dimensions Optional image dimensions to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateImage(file, dimensions = null) {
    // Validate file format
    if (file && !SUPPORTED_FORMATS.includes(file.type)) {
        throw new Error('[ERR_IV_001] Unsupported image format. Supported formats: JPEG, PNG, WebP');
    }

    // Validate file size
    if (file && file.size > MAX_FILE_SIZE) {
        throw new Error('[ERR_IV_004] Image file size too large. Maximum size: 10MB');
    }

    // Validate dimensions if provided
    if (dimensions) {
        if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
            throw new Error(`[ERR_IV_002] Image dimensions too large. Maximum dimension: ${MAX_DIMENSION}px`);
        }
        if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
            throw new Error(`[ERR_IV_003] Image dimensions too small. Minimum dimension: ${MIN_DIMENSION}px`);
        }
    }

    return true;
}

/**
 * Loads and validates an image file
 * @param {File} file Image file to load and validate
 * @returns {Promise<HTMLImageElement>} Loaded and validated image element
 */
export function loadAndValidateImage(file) {
    return new Promise((resolve, reject) => {
        // First validate the file
        try {
            validateImage(file);
        } catch (error) {
            reject(error);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    validateImage(file, { width: img.width, height: img.height });
                    resolve(img);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => {
                reject(new Error('[ERR_IV_005] Failed to load image'));
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            reject(new Error('[ERR_IV_006] Failed to read image file'));
        };
        reader.readAsDataURL(file);
    });
}
