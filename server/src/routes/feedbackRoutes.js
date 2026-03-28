import express from "express";
import { getApprovedFeedback, submitFeedback, getAllFeedback, approveFeedback, deleteFeedback } from "../controllers/feedbackController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/approved", protect, getApprovedFeedback);
router.post("/", protect, submitFeedback);
router.get("/", protect, authorizeRoles("admin"), getAllFeedback);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveFeedback);
router.delete("/:id", protect, authorizeRoles("admin"), deleteFeedback);

export default router;
