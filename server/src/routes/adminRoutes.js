import express from "express";
import {
  getAdminActivity,
  getAdminStats,
  getModulePlaceholderData,
  getProgrammeList,
  getRecentAdminActivity,
  prepareUploadStructure,
  previewSemesterPromotion,
  promoteSemester,
} from "../controllers/adminController.js";
import {
  addEnrollmentNumber,
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

// Semester management
router.get("/semester/preview", previewSemesterPromotion);
router.patch("/semester/promote", promoteSemester);
router.get("/programmes", getProgrammeList);

// Enrollment number management
router.get("/enrollment-numbers", getEnrollmentNumbers);
router.post("/enrollment-numbers", addEnrollmentNumber);
router.delete("/enrollment-numbers/:id", deleteEnrollmentNumber);

export default router;
