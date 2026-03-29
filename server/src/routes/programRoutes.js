import express from "express";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  updateSemesterCourses,
  updateElectivePool,
} from "../controllers/programController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllPrograms);
router.post("/", protect, authorizeRoles("admin"), createProgram);
router.put("/:id", protect, authorizeRoles("admin"), updateProgram);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProgram);
router.put(
  "/:id/semesters/:semNumber",
  protect,
  authorizeRoles("admin"),
  updateSemesterCourses
);
router.put("/:id/electives", protect, authorizeRoles("admin"), updateElectivePool);

export default router;
