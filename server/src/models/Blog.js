import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    author: {
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

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
