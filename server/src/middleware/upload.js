import multer from "multer";

// ─── Allowed MIME type sets ───────────────────────────────────────────────────

export const MIME_TYPES = {
  // Pure document types
  documents: new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ]),

  // Image-only uploads
  images: new Set(["image/jpeg", "image/png", "image/webp"]),

  // Academic resources: documents + images (timetables are often uploaded as images)
  resources: new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
};

// ─── Size limits ──────────────────────────────────────────────────────────────

const SIZE_LIMITS = {
  documents: 15 * 1024 * 1024, // 15 MB
  images:     5 * 1024 * 1024, //  5 MB
  resources: 15 * 1024 * 1024, // 15 MB
};

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns a multer instance that stores the file in memory (buffer).
 * The buffer is available as req.file.buffer in controllers, ready to be
 * forwarded to ImageKit.
 *
 * @param {string} _folder   - Kept for API compatibility; not used for storage
 * @param {"documents"|"images"|"resources"} mimeGroup
 */
export const createUploader = (_folder, mimeGroup) => {
  const allowedTypes = MIME_TYPES[mimeGroup];
  const maxSize = SIZE_LIMITS[mimeGroup];

  if (!allowedTypes) {
    throw new Error(
      `Unknown mimeGroup "${mimeGroup}". Use "documents", "images", or "resources".`,
    );
  }

  const fileFilter = (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          `File type "${file.mimetype}" is not allowed.`,
        ),
        false,
      );
    }
  };

  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSize },
  });
};
