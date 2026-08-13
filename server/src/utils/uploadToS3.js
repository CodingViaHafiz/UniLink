import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";

/**
 * Upload a file buffer to AWS S3.
 * @param {Buffer} buffer           - File buffer from multer memoryStorage
 * @param {string} originalName     - Original filename from the client
 * @param {string} folder           - Subfolder (e.g. "avatars", "feed")
 * @param {string} [mimeType]       - Content type of the file
 * @returns {Promise<{ url: string, fileId: string }>} fileId is the S3 object Key
 */
export const uploadToS3 = async (buffer, originalName, folder, mimeType = "application/octet-stream") => {
  const safeName = originalName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_.-]/g, "");

  const key = `unilink/${folder}/${Date.now()}-${safeName}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "us-east-1";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    if (err.name === "PermanentRedirect" || err.message?.includes("specified endpoint")) {
      throw new Error(
        `AWS Region Mismatch: Your S3 bucket "${bucketName}" is located in a different region than AWS_REGION="${region}" in server/.env. Please update AWS_REGION in server/.env to match your S3 bucket region in AWS Console and restart the server.`
      );
    }
    throw err;
  }

  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { url, fileId: key };
};

/**
 * Delete an object from AWS S3 by its Key.
 * Non-fatal — logs the error but does not throw.
 * @param {string} fileId - S3 Key or file identifier
 */
export const deleteFromS3 = async (fileId) => {
  if (!fileId) return;
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileId,
    });
    await s3Client.send(command);
  } catch (err) {
    console.error(`[AWS S3] Failed to delete file ${fileId}:`, err.message);
  }
};

// Aliases for smooth migration
export const uploadToImageKit = uploadToS3;
export const deleteFromImageKit = deleteFromS3;
