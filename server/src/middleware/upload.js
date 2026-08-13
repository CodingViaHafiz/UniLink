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

export const SIZE_LIMITS = {
  documents: 15 * 1024 * 1024, // 15 MB
  images:     5 * 1024 * 1024, //  5 MB
  resources: 15 * 1024 * 1024, // 15 MB
};

export const FORMATTED_SIZE_LIMITS = {
  documents: "15 MB",
  images: "5 MB",
  resources: "15 MB",
};

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns a multer uploader wrapper that stores the file in memory (buffer).
 * Automatically formats file size limit error messages with explicit storage limits.
 *
 * @param {string} _folder   - Kept for API compatibility
 * @param {"documents"|"images"|"resources"} mimeGroup
 */
export const createUploader = (_folder, mimeGroup) => {
  const allowedTypes = MIME_TYPES[mimeGroup];
  const maxSize = SIZE_LIMITS[mimeGroup];
  const limitLabel = FORMATTED_SIZE_LIMITS[mimeGroup] || `${Math.round(maxSize / (1024 * 1024))} MB`;

  if (!allowedTypes) {
    throw new Error(
      `Unknown mimeGroup "${mimeGroup}". Use "documents", "images", or "resources".`,
    );
  }

  const fileFilter = (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `File type "${file.mimetype}" is not allowed.`,
      );
      err.customMessage = `File type "${file.mimetype}" is not allowed for ${mimeGroup}. Maximum allowed storage limit is ${limitLabel}.`;
      cb(err, false);
    }
  };

  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSize },
  });

  const wrapHandler = (handler) => (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: `File is too large. Maximum allowed storage limit for ${mimeGroup} is ${limitLabel}.`,
          });
        }
        return res.status(400).json({
          message: err.customMessage || err.message || err.field || "Invalid file upload.",
        });
      }
      return next(err);
    });
  };

  return {
    single: (fieldName) => wrapHandler(upload.single(fieldName)),
    array: (fieldName, maxCount) => wrapHandler(upload.array(fieldName, maxCount)),
    fields: (fields) => wrapHandler(upload.fields(fields)),
    any: () => wrapHandler(upload.any()),
  };
};
