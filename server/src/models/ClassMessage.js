import mongoose from "mongoose";

const classMessageSchema = new mongoose.Schema(
  {
    senderId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName:    { type: String, required: true, trim: true },
    senderRole:    { type: String, enum: ["faculty", "admin"], required: true },

    programmeId:   { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    programmeCode: { type: String, required: true, trim: true, uppercase: true },
    programmeName: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["message", "assignment", "notice"],
      default: "message",
    },

    // Required for assignment / notice; empty string for plain messages
    title:   { type: String, trim: true, maxlength: 200, default: "" },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 3000 },

    attachmentUrl:  { type: String, default: null },
    attachmentName: { type: String, default: null },

    // Assignments only
    dueDate: { type: Date, default: null },

    // null = sent to entire programme; number = specific semester only
    semester: { type: Number, default: null, min: 1, max: 12 },
  },
  { timestamps: true }
);

classMessageSchema.index({ programmeId: 1, semester: 1, createdAt: -1 });

export default mongoose.model("ClassMessage", classMessageSchema);
