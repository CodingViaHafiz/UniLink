import mongoose from "mongoose";

const lostFoundItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "resolved", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
    },
  },
  { timestamps: true }
);

const LostFoundItem = mongoose.model("LostFoundItem", lostFoundItemSchema);

export default LostFoundItem;
