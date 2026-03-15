import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    price: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
    },
    mapUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Hostel = mongoose.model("Hostel", hostelSchema);

export default Hostel;
