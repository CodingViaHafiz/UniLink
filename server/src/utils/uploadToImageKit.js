import { toFile } from "@imagekit/nodejs";
import imagekit from "../config/imagekit.js";

/**
 * Upload a file buffer to ImageKit.
 * @param {Buffer} buffer           - File buffer from multer memoryStorage
 * @param {string} originalName     - Original filename from the client
 * @param {string} folder           - ImageKit subfolder (e.g. "avatars", "feed")
 * @returns {Promise<{ url: string, fileId: string }>}
 */
export const uploadToImageKit = async (buffer, originalName, folder) => {
  const safeName = originalName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_.-]/g, "");

  const fileName = `${Date.now()}-${safeName}`;
  const file = await toFile(buffer, fileName);

  const result = await imagekit.files.upload({
    file,
    fileName,
    folder: `/unilink/${folder}`,
    useUniqueFileName: false,
  });

  return { url: result.url, fileId: result.fileId };
};

/**
 * Delete a file from ImageKit by its fileId.
 * Non-fatal — logs the error but does not throw.
 * @param {string} fileId
 */
export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return;
  try {
    await imagekit.files.delete(fileId);
  } catch (err) {
    console.error(`[ImageKit] Failed to delete file ${fileId}:`, err.message);
  }
};
