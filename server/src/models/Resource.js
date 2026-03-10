import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["notes", "past-papers", "timetable"],
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedByName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["faculty", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
