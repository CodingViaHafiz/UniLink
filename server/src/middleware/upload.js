import fs from "fs";
import multer from "multer";
import path from "path";

// ─── Allowed MIME type sets ───────────────────────────────────────────────────

export const MIME_TYPES = {
  // Academic resources: PDF, Word, PowerPoint, Excel, plain text
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

  // Hostel images: common web-safe formats only
  images: new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
};

// ─── Size limits ──────────────────────────────────────────────────────────────

const SIZE_LIMITS = {
  documents: 15 * 1024 * 1024,  // 15 MB
  images:     5 * 1024 * 1024,  //  5 MB
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const buildStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destination = path.resolve("uploads", folder);
      ensureDir(destination);
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9_.-]/g, "");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * @param {string} folder       - subfolder inside /uploads (e.g. "resources")
 * @param {"documents"|"images"} mimeGroup - which MIME allowlist to enforce
 */
export const createUploader = (folder, mimeGroup) => {
  const allowedTypes = MIME_TYPES[mimeGroup];
  const maxSize = SIZE_LIMITS[mimeGroup];

  if (!allowedTypes) {
    throw new Error(`Unknown mimeGroup "${mimeGroup}". Use "documents" or "images".`);
  }

  const fileFilter = (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          `File type "${file.mimetype}" is not allowed.`
        ),
        false
      );
    }
  };

  return multer({
    storage: buildStorage(folder),
    fileFilter,
    limits: { fileSize: maxSize },
  });
};
