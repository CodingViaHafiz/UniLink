import mongoose from "mongoose";

const marketListingSchema = new mongoose.Schema(
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
    price: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["textbooks", "electronics", "notes", "other"],
      default: "other",
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
      enum: ["pending", "approved", "rejected"],
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
  { timestamps: true },
);

const MarketListing = mongoose.model("MarketListing", marketListingSchema);

export default MarketListing;
