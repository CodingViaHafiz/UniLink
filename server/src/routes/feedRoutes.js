import express from "express";
import { createPost, deletePost, getPosts, reactToPost, togglePin, voteOnPoll } from "../controllers/feedController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const upload = createUploader("feed", "images");

// Public — anyone logged in can read the feed
router.get("/", protect, getPosts);

// Faculty / Admin — create & delete posts
router.post("/", protect, authorizeRoles("faculty", "admin"), upload.single("image"), createPost);
router.delete("/:id", protect, authorizeRoles("faculty", "admin"), deletePost);

// Admin only — pin/unpin
router.patch("/:id/pin", protect, authorizeRoles("admin"), togglePin);

// Any authenticated user — react & vote
router.post("/:id/react", protect, reactToPost);
router.post("/:id/vote", protect, voteOnPoll);

export default router;
