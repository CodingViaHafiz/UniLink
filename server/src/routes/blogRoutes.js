import express from "express";
import { createBlog, getPlatformStats, getPublishedBlogs } from "../controllers/blogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPublishedBlogs);
router.get("/stats", getPlatformStats);
router.post("/", protect, authorizeRoles("faculty", "admin"), createBlog);

export default router;
