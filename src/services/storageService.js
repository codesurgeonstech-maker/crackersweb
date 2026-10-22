import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./firebase";

/**
 * Compresses an image file and converts to Base64 data URL.
 * Uses HTML Canvas to ensure compact payload for Firestore storage.
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} quality
 * @returns {Promise<string>}
 */
function compressImageToBase64(file, maxWidth = 400, maxHeight = 400, quality = 0.85) {
  // If SVG, return direct data URL without canvas rasterization
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if PNG, otherwise use JPEG for small size
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file for a shop product or logo.
 * If Firebase Storage upload is blocked by CORS or network,
 * it automatically falls back to an optimized base64 image data URL.
 * @param {File} file 
 * @param {string} shopId 
 * @param {string} folder 'products' | 'logos'
 * @param {string} filename 
 * @returns {Promise<string>} Download URL or Base64 Data URL
 */
export async function uploadImage(file, shopId, folder = 'products', filename = '') {
  if (!file) throw new Error('No file provided for upload.');

  // Validate file type & size (max 5MB)
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file (PNG, JPG, WEBP, SVG).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit.');
  }

  const cleanFilename = filename ? `${filename}_${Date.now()}` : `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storagePath = `shops/${shopId}/${folder}/${cleanFilename}`;

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: { shopId }
      });
      return await getDownloadURL(snapshot.ref);
    } catch (storageErr) {
      console.warn(
        `Firebase Storage upload failed (${storageErr?.message || storageErr}). ` +
        `Falling back to optimized Base64 image so the operation succeeds seamlessly.`
      );
      const maxDim = folder === 'logos' ? 400 : 800;
      return await compressImageToBase64(file, maxDim, maxDim, 0.85);
    }
  }

  // Fallback for preview / demo mode: Convert file to Base64 data URL
  const maxDim = folder === 'logos' ? 400 : 800;
  return await compressImageToBase64(file, maxDim, maxDim, 0.85);
}
