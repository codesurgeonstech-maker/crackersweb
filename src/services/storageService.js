import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./firebase";

/**
 * Upload an image file for a shop product or logo.
 * @param {File} file 
 * @param {string} shopId 
 * @param {string} folder 'products' | 'logos'
 * @param {string} filename 
 * @returns {Promise<string>} Download URL
 */
export async function uploadImage(file, shopId, folder = 'products', filename = '') {
  if (!file) throw new Error('No file provided for upload.');

  // Validate file type & size (max 5MB)
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file (PNG, JPG, WEBP).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size exceeds 5MB limit.');
  }

  const cleanFilename = filename ? `${filename}_${Date.now()}` : `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storagePath = `shops/${shopId}/${folder}/${cleanFilename}`;

  if (isFirebaseConfigured && storage) {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: { shopId }
    });
    return await getDownloadURL(snapshot.ref);
  }

  // Fallback for preview / demo mode: Convert file to Base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
