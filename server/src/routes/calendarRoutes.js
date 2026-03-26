import express from "express";
import { createEvent, deleteEvent, getUpcomingEvents } from "../controllers/calendarController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/upcoming", protect, getUpcomingEvents);
router.post("/", protect, authorizeRoles("admin"), createEvent);
router.delete("/:id", protect, authorizeRoles("admin"), deleteEvent);

export default router;
