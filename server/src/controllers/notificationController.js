import Notification from "../models/Notification.js";

const toResponse = (n) => ({
  id:        n._id.toString(),
  type:      n.type,
  title:     n.title,
  body:      n.body,
  data:      n.data,
  read:      n.read,
  createdAt: n.createdAt,
});

// GET /api/notifications?limit=20&before=<id>
export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, before } = req.query;
    const cap   = Math.min(Number(limit), 50);
    const query = { recipientId: req.user._id };
    if (before) query._id = { $lt: before };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      read:        false,
    });

    return res.status(200).json({
      notifications: notifications.map(toResponse),
      unreadCount,
      hasMore:       notifications.length === cap,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications.", error: error.message });
  }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark notifications as read.", error: error.message });
  }
};

// PATCH /api/notifications/:id/read
export const markOneRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({ notification: toResponse(notification) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark notification as read.", error: error.message });
  }
};
