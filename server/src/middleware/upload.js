import fs from "fs";
import path from "path";
import multer from "multer";

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
      const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_.-]/g, "");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

export const createUploader = (folder, options = {}) => multer({ storage: buildStorage(folder), ...options });
