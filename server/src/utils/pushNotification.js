import Notification from "../models/Notification.js";

/**
 * Creates a Notification DB record and emits it to the recipient's
 * personal socket room (`user:<recipientId>`).
 *
 * Never throws — errors are logged and swallowed so callers don't fail.
 *
 * @param {import("socket.io").Server} io
 * @param {string|import("mongoose").ObjectId} recipientId
 * @param {string} type   - e.g. "support_reply", "class_message"
 * @param {string} title
 * @param {string} body
 * @param {object} data   - arbitrary extra payload stored on the record
 */
const pushNotification = async (io, recipientId, type, title, body = "", data = {}) => {
  try {
    const notif = await Notification.create({ recipientId, type, title, body, data });
    if (io) {
      io.to(`user:${recipientId}`).emit("notification", {
        id:        notif._id.toString(),
        type,
        title,
        body,
        data,
        read:      false,
        createdAt: notif.createdAt,
      });
    }
  } catch (err) {
    console.error("[pushNotification] failed:", err.message);
  }
};

export default pushNotification;
