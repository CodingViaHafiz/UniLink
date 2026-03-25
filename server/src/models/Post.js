import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 100 },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
    author: { type: String, required: true, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["faculty", "admin"], required: true },

    // Optional image attachment
    imageUrl: { type: String, default: null },

    // Optional poll — only set when post includes a poll
    poll: {
      type: {
        question: { type: String, trim: true, maxlength: 200 },
        options: [pollOptionSchema],
      },
      default: undefined,
    },

    // Reactions — each user can pick one type
    reactions: {
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      thumbsup: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
