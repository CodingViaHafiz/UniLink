import express from "express";
import {
  createResource,
  deleteResource,
  getMyResources,
  getResources,
  getResourcesByType,
  updateResource,
} from "../controllers/resourceController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const upload = createUploader("resources", "documents");

router.get("/", getResources);
router.get("/mine", protect, authorizeRoles("faculty", "admin"), getMyResources);
router.get("/:type", getResourcesByType);
router.post("/", protect, authorizeRoles("faculty", "admin"), upload.single("file"), createResource);
router.put("/:id", protect, authorizeRoles("faculty", "admin"), updateResource);
router.delete("/:id", protect, authorizeRoles("faculty", "admin"), deleteResource);

export default router;
