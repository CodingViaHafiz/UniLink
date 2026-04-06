import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:        { type: String, required: true, trim: true },
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    body:        { type: String, default: "", trim: true, maxlength: 500 },
    data:        { type: mongoose.Schema.Types.Mixed, default: {} },
    read:        { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
