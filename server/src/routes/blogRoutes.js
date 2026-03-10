import express from "express";
import { createBlog, deleteBlog, getMyBlogs, getPlatformStats, getPublishedBlogs, updateBlog } from "../controllers/blogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPublishedBlogs);
router.get("/stats", getPlatformStats);
router.get("/mine", protect, authorizeRoles("faculty", "admin"), getMyBlogs);
router.post("/", protect, authorizeRoles("faculty", "admin"), createBlog);
router.put("/:id", protect, authorizeRoles("faculty", "admin"), updateBlog);
router.delete("/:id", protect, authorizeRoles("faculty", "admin"), deleteBlog);

export default router;
