import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportConversation", required: true },
    senderId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName:     { type: String, required: true, trim: true },
    senderRole:     { type: String, enum: ["student", "admin"], required: true },
    content:        { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: true }
);

supportMessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model("SupportMessage", supportMessageSchema);
