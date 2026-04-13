import ClassMessage from "../models/ClassMessage.js";
import Program from "../models/Program.js";
import User from "../models/User.js";
import { uploadToImageKit } from "../utils/uploadToImageKit.js";
import pushNotification from "../utils/pushNotification.js";

const toResponse = (msg) => ({
  id:             msg._id.toString(),
  senderId:       msg.senderId.toString(),
  senderName:     msg.senderName,
  senderRole:     msg.senderRole,
  programmeId:    msg.programmeId.toString(),
  programmeCode:  msg.programmeCode,
  programmeName:  msg.programmeName,
  type:           msg.type,
  title:          msg.title,
  content:        msg.content,
  attachmentUrl:  msg.attachmentUrl,
  attachmentName: msg.attachmentName,
  dueDate:        msg.dueDate,
  semester:       msg.semester ?? null,
  createdAt:      msg.createdAt,
});

// ─── Semester query helper ─────────────────────────────────────────────────────
// semester param meanings:
//   undefined / not sent → no filter (faculty "all" view — every message)
//   "0"                  → only null-semester messages (student with no semester set)
//   "N" (N >= 1)         → null-semester  +  semester-N messages (normal student view)
const buildSemesterFilter = (semesterParam) => {
  if (semesterParam === undefined || semesterParam === null) return {};

  const sem = Number(semesterParam);
  if (sem === 0)  return { semester: null };
  if (sem >= 1)   return { $or: [{ semester: null }, { semester: sem }] };
  return {};
};

// GET /api/class-messages?programmeId=xxx&semester=N&before=<id>&limit=30
export const getMessages = async (req, res) => {
  try {
    const { programmeId, semester, before, limit = 30 } = req.query;

    if (!programmeId) {
      return res.status(400).json({ message: "programmeId is required." });
    }

    const query = {
      programmeId,
      ...buildSemesterFilter(semester),
    };
    if (before) query._id = { $lt: before };

    const cap = Math.min(Number(limit), 50);
    const messages = await ClassMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean();

    return res.status(200).json({
      messages: messages.reverse().map(toResponse),
      hasMore:  messages.length === cap,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages.", error: error.message });
  }
};

// POST /api/class-messages
export const sendMessage = async (req, res) => {
  try {
    const { programmeId, type = "message", title = "", content, dueDate, semester } = req.body;

    if (!programmeId || !content?.trim()) {
      return res.status(400).json({ message: "programmeId and content are required." });
    }
    if (["assignment", "notice"].includes(type) && !title?.trim()) {
      return res.status(400).json({ message: "Title is required for assignments and notices." });
    }

    const programme = await Program.findById(programmeId).select("name code");
    if (!programme) {
      return res.status(404).json({ message: "Programme not found." });
    }

    const msgData = {
      senderId:      req.user._id,
      senderName:    req.user.fullName,
      senderRole:    req.user.role,
      programmeId,
      programmeCode: programme.code,
      programmeName: programme.name,
      type,
      title:         title.trim(),
      content:       content.trim(),
      semester:      null,
    };

    if (semester && Number(semester) >= 1) {
      msgData.semester = Number(semester);
    }
    if (req.file) {
      const { url } = await uploadToImageKit(req.file.buffer, req.file.originalname, "class-messages");
      msgData.attachmentUrl  = url;
      msgData.attachmentName = req.file.originalname;
    }
    if (type === "assignment" && dueDate) {
      msgData.dueDate = new Date(dueDate);
    }

    const message = await ClassMessage.create(msgData);
    const response = toResponse(message);

    const io = req.app.get("io");
    if (io) {
      io.to(`programme:${programmeId}`).emit("class-message", response);

      // ── Notify students in this programme ───────────────────────────────────
      const studentQuery = {
        role:     "student",
        program:  programme.name,
        isActive: true,
        _id:      { $ne: req.user._id },
      };
      // If message targets a specific semester, only notify students in that semester
      if (msgData.semester) studentQuery.currentSemester = msgData.semester;

      const typeLabel = type === "assignment" ? "New Assignment" : type === "notice" ? "New Notice" : "New Message";
      const notifTitle = title.trim() ? `${typeLabel}: ${title.trim()}` : `${typeLabel} in ${programme.code}`;
      const notifBody  = content.trim().slice(0, 120);

      const students = await User.find(studentQuery).select("_id").lean();
      students.forEach(({ _id }) => {
        pushNotification(io, _id, "class_message", notifTitle, notifBody, {
          programmeId:   programmeId.toString(),
          programmeCode: programme.code,
          messageId:     message._id.toString(),
          messageType:   type,
          semester:      msgData.semester ?? null,
        });
      });
    }

    return res.status(201).json({ message: "Message sent.", classMessage: response });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message.", error: error.message });
  }
};

// DELETE /api/class-messages/:id  (owner or admin)
export const deleteMessage = async (req, res) => {
  try {
    const msg = await ClassMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found." });

    const isOwner = msg.senderId.toString() === req.user._id.toString();
    const isAdmin  = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this message." });
    }

    const programmeId = msg.programmeId.toString();
    await msg.deleteOne();

    const io = req.app.get("io");
    if (io) io.to(`programme:${programmeId}`).emit("class-message-deleted", req.params.id);

    return res.status(200).json({ message: "Message deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete message.", error: error.message });
  }
};
