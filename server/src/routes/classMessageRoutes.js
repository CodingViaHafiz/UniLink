import express from "express";
import { deleteMessage, getMessages, sendMessage } from "../controllers/classMessageController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();

// Accepts PDFs, Word, Excel, PPT, plain text, and images (same as resources)
const upload = createUploader("class-messages", "resources");

// Any authenticated user can read their programme's messages
router.get("/", protect, getMessages);

// Only faculty and admin can send
router.post("/", protect, authorizeRoles("faculty", "admin"), upload.single("attachment"), sendMessage);

// Owner or admin can delete
router.delete("/:id", protect, authorizeRoles("faculty", "admin"), deleteMessage);

export default router;
