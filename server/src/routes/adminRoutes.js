import express from "express";
import {
  getAdminActivity,
  getAdminStats,
  getModulePlaceholderData,
  getRecentAdminActivity,
  prepareUploadStructure,
} from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getAdminStats);
router.get("/activity", getAdminActivity);
router.get("/recent-activity", getRecentAdminActivity);
router.get("/placeholders/:moduleKey", getModulePlaceholderData);
router.post("/uploads/:resourceType", prepareUploadStructure);

export default router;
