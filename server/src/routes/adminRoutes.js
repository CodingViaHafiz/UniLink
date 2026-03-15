import express from "express";
import {
  getAdminActivity,
  getAdminStats,
  getModulePlaceholderData,
  getRecentAdminActivity,
  prepareUploadStructure,
} from "../controllers/adminController.js";
import {
  addEnrollmentNumber,
  bulkAddEnrollmentNumbers,
  deleteEnrollmentNumber,
  getEnrollmentNumbers,
} from "../controllers/enrollmentController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

// Dashboard
router.get("/stats", getAdminStats);
router.get("/activity", getAdminActivity);
router.get("/recent-activity", getRecentAdminActivity);
router.get("/placeholders/:moduleKey", getModulePlaceholderData);
router.post("/uploads/:resourceType", prepareUploadStructure);

// Enrollment number management
router.get("/enrollment-numbers", getEnrollmentNumbers);
router.post("/enrollment-numbers", addEnrollmentNumber);
router.post("/enrollment-numbers/bulk", bulkAddEnrollmentNumbers);
router.delete("/enrollment-numbers/:id", deleteEnrollmentNumber);

export default router;
