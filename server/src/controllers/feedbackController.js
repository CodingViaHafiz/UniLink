import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import pushNotification from "../utils/pushNotification.js";

const toResponse = (item) => ({
  id: item._id,
  content: item.content,
  category: item.category,
  status: item.status,
  createdAt: item.createdAt,
});

export const submitFeedback = async (req, res) => {
  try {
    const { content, category } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Content is required." });
    }

    const feedback = await Feedback.create({
      content,
      category: category || "general",
    });

    // Notify all admins (feedback is anonymous — no user id stored)
    const io = req.app.get("io");
    if (io) {
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      admins.forEach(({ _id }) =>
        pushNotification(io, _id, "feedback_new",
          "New Anonymous Feedback",
          `Category: ${feedback.category} — "${feedback.content.slice(0, 80)}${feedback.content.length > 80 ? "…" : ""}"`,
          { feedbackId: feedback._id.toString() }
        )
      );
    }

    return res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback: toResponse(feedback),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to submit feedback.", error: error.message });
  }
};

export const getApprovedFeedback = async (_req, res) => {
  try {
    const feedbacks = await Feedback.find({ status: "approved" }).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ feedbacks: feedbacks.map((f) => toResponse(f)) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch feedback.", error: error.message });
  }
};

export const getAllFeedback = async (_req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ feedbacks: feedbacks.map((f) => toResponse(f)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch feedback.", error: error.message });
  }
};

export const approveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'." });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    feedback.status = status;
    await feedback.save();

    return res.status(200).json({
      message: `Feedback ${status} successfully.`,
      feedback: toResponse(feedback),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update feedback.", error: error.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    await feedback.deleteOne();
    return res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete feedback.", error: error.message });
  }
};
