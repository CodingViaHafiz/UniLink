import SupportConversation from "../models/SupportConversation.js";
import SupportMessage from "../models/SupportMessage.js";
import User from "../models/User.js";
import pushNotification from "../utils/pushNotification.js";

/* ── Response helpers ────────────────────────────────────────────────────── */

const toConvResponse = (conv) => ({
  id:                 conv._id.toString(),
  studentId:          conv.studentId.toString(),
  studentName:        conv.studentName,
  subject:            conv.subject,
  status:             conv.status,
  lastMessageAt:      conv.lastMessageAt,
  lastMessagePreview: conv.lastMessagePreview,
  unreadByAdmin:      conv.unreadByAdmin,
  unreadByStudent:    conv.unreadByStudent,
  createdAt:          conv.createdAt,
  updatedAt:          conv.updatedAt,
});

const toMsgResponse = (msg) => ({
  id:             msg._id.toString(),
  conversationId: msg.conversationId.toString(),
  senderId:       msg.senderId.toString(),
  senderName:     msg.senderName,
  senderRole:     msg.senderRole,
  content:        msg.content,
  createdAt:      msg.createdAt,
});

/* ── GET /api/support/conversations ─────────────────────────────────────── */
// student → their own conversations; admin → all conversations

export const getConversations = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { studentId: req.user._id };
    const conversations = await SupportConversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({ conversations: conversations.map(toConvResponse) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversations.", error: error.message });
  }
};

/* ── POST /api/support/conversations ────────────────────────────────────── */
// student only — starts a new support thread

export const startConversation = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject?.trim()) {
      return res.status(400).json({ message: "Subject is required." });
    }

    // One open conversation per student at a time
    const existing = await SupportConversation.findOne({
      studentId: req.user._id,
      status:    "open",
    }).lean();
    if (existing) {
      return res.status(409).json({
        message:        "You already have an open support conversation.",
        conversationId: existing._id.toString(),
      });
    }

    const conversation = await SupportConversation.create({
      studentId:   req.user._id,
      studentName: req.user.fullName,
      subject:     subject.trim(),
    });

    const response = toConvResponse(conversation);

    const io = req.app.get("io");
    if (io) {
      io.to("support:admin").emit("support-conversation", response);
    }

    // Notify all active admins
    const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
    for (const admin of admins) {
      await pushNotification(io, admin._id, "support_new",
        "New Support Request",
        `${req.user.fullName}: ${subject.trim()}`,
        { conversationId: conversation._id.toString() }
      );
    }

    return res.status(201).json({ conversation: response });
  } catch (error) {
    return res.status(500).json({ message: "Failed to start conversation.", error: error.message });
  }
};

/* ── GET /api/support/conversations/:id/messages ────────────────────────── */

export const getMessages = async (req, res) => {
  try {
    const conversation = await SupportConversation.findById(req.params.id).lean();
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });

    const isAdmin   = req.user.role === "admin";
    const isOwner   = conversation.studentId.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { before, limit = 50 } = req.query;
    const query = { conversationId: req.params.id };
    if (before) query._id = { $lt: before };

    const cap      = Math.min(Number(limit), 100);
    const messages = await SupportMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean();

    return res.status(200).json({
      conversation: toConvResponse(conversation),
      messages:     messages.reverse().map(toMsgResponse),
      hasMore:      messages.length === cap,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages.", error: error.message });
  }
};

/* ── POST /api/support/conversations/:id/messages ───────────────────────── */
// both student and admin can send

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required." });
    }

    const conversation = await SupportConversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });

    if (conversation.status === "resolved") {
      return res.status(400).json({ message: "This conversation is resolved. Please start a new one." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = conversation.studentId.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const message = await SupportMessage.create({
      conversationId: conversation._id,
      senderId:       req.user._id,
      senderName:     req.user.fullName,
      senderRole:     isAdmin ? "admin" : "student",
      content:        content.trim(),
    });

    // Update conversation metadata
    const preview = content.trim().substring(0, 100);
    conversation.lastMessageAt      = message.createdAt;
    conversation.lastMessagePreview = preview;
    if (isAdmin) {
      conversation.unreadByAdmin    = 0;   // admin just replied — admin side is caught up
      conversation.unreadByStudent += 1;
    } else {
      conversation.unreadByStudent  = 0;   // student just sent — student side is caught up
      conversation.unreadByAdmin   += 1;
    }
    await conversation.save();

    const msgResp  = toMsgResponse(message);
    const convResp = toConvResponse(conversation);

    const io = req.app.get("io");
    if (io) {
      // Both parties in the conversation room get the new message
      io.to(`support:${conversation._id}`).emit("support-message", {
        message:      msgResp,
        conversation: convResp,
      });
      // Admin inbox list gets updated unread counts / preview
      io.to("support:admin").emit("support-conversation-updated", convResp);
    }

    // Notify the other party
    if (isAdmin) {
      await pushNotification(io, conversation.studentId, "support_reply",
        "Admin replied to your request",
        `${req.user.fullName}: ${preview}`,
        { conversationId: conversation._id.toString() }
      );
    } else {
      const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
      for (const admin of admins) {
        await pushNotification(io, admin._id, "support_message",
          "New message in support",
          `${req.user.fullName}: ${preview}`,
          { conversationId: conversation._id.toString() }
        );
      }
    }

    return res.status(201).json({ message: "Message sent.", supportMessage: msgResp });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message.", error: error.message });
  }
};

/* ── PATCH /api/support/conversations/:id/resolve ───────────────────────── */
// admin only

export const resolveConversation = async (req, res) => {
  try {
    const conversation = await SupportConversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });

    conversation.status = "resolved";
    await conversation.save();

    const response = toConvResponse(conversation);
    const io = req.app.get("io");
    if (io) {
      io.to(`support:${conversation._id}`).emit("support-conversation-resolved", response);
      io.to("support:admin").emit("support-conversation-updated", response);
    }

    await pushNotification(io, conversation.studentId, "support_resolved",
      "Your support request was resolved",
      `"${conversation.subject}" has been marked as resolved.`,
      { conversationId: conversation._id.toString() }
    );

    return res.status(200).json({ conversation: response });
  } catch (error) {
    return res.status(500).json({ message: "Failed to resolve conversation.", error: error.message });
  }
};

/* ── PATCH /api/support/conversations/:id/read ──────────────────────────── */
// marks unread count to 0 for the calling role

export const markRead = async (req, res) => {
  try {
    const conversation = await SupportConversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });

    const isAdmin = req.user.role === "admin";
    const isOwner = conversation.studentId.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (isAdmin) conversation.unreadByAdmin = 0;
    else         conversation.unreadByStudent = 0;
    await conversation.save();

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark as read.", error: error.message });
  }
};
