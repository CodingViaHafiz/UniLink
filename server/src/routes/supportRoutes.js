import express from "express";
import {
  getConversations,
  getMessages,
  markRead,
  resolveConversation,
  sendMessage,
  startConversation,
} from "../controllers/supportController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both roles list their conversations
router.get("/conversations", protect, authorizeRoles("student", "admin"), getConversations);

// Student starts a conversation
router.post("/conversations", protect, authorizeRoles("student"), startConversation);

// Both roles fetch messages for a conversation
router.get("/conversations/:id/messages", protect, authorizeRoles("student", "admin"), getMessages);

// Both roles send a message
router.post("/conversations/:id/messages", protect, authorizeRoles("student", "admin"), sendMessage);

// Admin resolves a conversation
router.patch("/conversations/:id/resolve", protect, authorizeRoles("admin"), resolveConversation);

// Both roles mark their side as read
router.patch("/conversations/:id/read", protect, authorizeRoles("student", "admin"), markRead);

export default router;
