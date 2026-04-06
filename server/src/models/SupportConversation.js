import mongoose from "mongoose";

const supportConversationSchema = new mongoose.Schema(
  {
    studentId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName:        { type: String, required: true, trim: true },
    subject:            { type: String, required: true, trim: true, maxlength: 200 },
    status:             { type: String, enum: ["open", "resolved"], default: "open" },
    lastMessageAt:      { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: "", maxlength: 200 },
    unreadByAdmin:      { type: Number, default: 0, min: 0 },
    unreadByStudent:    { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

supportConversationSchema.index({ studentId: 1, status: 1 });
supportConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model("SupportConversation", supportConversationSchema);
