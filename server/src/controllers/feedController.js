import Post from "../models/Post.js";

/* ── Response helper ──────────────────────────────────────────────────────── */

const toPostResponse = (post) => ({
  id: post._id.toString(),
  content: post.content,
  author: post.author,
  authorId: post.authorId.toString(),
  role: post.role,
  imageUrl: post.imageUrl,
  poll:
    post.poll &&
    post.poll.question &&
    post.poll.options &&
    post.poll.options.length > 0
      ? {
          question: post.poll.question,
          options: post.poll.options.map((o) => ({
            id: o._id.toString(),
            text: o.text,
            votes: o.votes.length,
            voters: o.votes.map((v) => v.toString()),
          })),
        }
      : null,
  reactions: {
    love: post.reactions.love.map((id) => id.toString()),
    thumbsup: post.reactions.thumbsup.map((id) => id.toString()),
  },
  isPinned: post.isPinned,
  createdAt: post.createdAt,
});

/* ── Get pinned posts only (lightweight, for home page banner) ─────────── */

export const getPinnedPosts = async (_req, res) => {
  try {
    const posts = await Post.find({ isPinned: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("content author role createdAt");
    return res.status(200).json({
      notices: posts.map((p) => ({
        id: p._id.toString(),
        content: p.content,
        author: p.author,
        role: p.role,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch notices.", error: error.message });
  }
};

/* ── Get all posts (newest first, pinned on top) ──────────────────────────── */

export const getPosts = async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: 1 }).limit(100);
    return res.status(200).json({ posts: posts.map(toPostResponse) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch posts.", error: error.message });
  }
};

/* ── Create post (faculty / admin only) ───────────────────────────────────── */

export const createPost = async (req, res) => {
  try {
    const { content, pollQuestion, pollOptions } = req.body;

    console.log("[Feed] createPost body:", {
      content,
      pollQuestion,
      pollOptions,
      hasFile: !!req.file,
    });

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required." });
    }

    const postData = {
      content,
      author: req.user.fullName,
      authorId: req.user._id,
      role: req.user.role,
    };

    // Optional image
    if (req.file) {
      postData.imageUrl = `/uploads/feed/${req.file.filename}`;
    }

    // Optional poll
    if (pollQuestion && pollOptions) {
      const options =
        typeof pollOptions === "string" ? JSON.parse(pollOptions) : pollOptions;
      if (
        Array.isArray(options) &&
        options.length >= 2 &&
        options.length <= 6
      ) {
        postData.poll = {
          question: pollQuestion,
          options: options.map((text) => ({ text, votes: [] })),
        };
      }
    }

    const post = await Post.create(postData);

    const io = req.app.get("io");
    if (io) io.emit("new-post", toPostResponse(post));

    return res
      .status(201)
      .json({ message: "Post created.", post: toPostResponse(post) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create post.", error: error.message });
  }
};

/* ── Delete post (owner or admin) ─────────────────────────────────────────── */

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const isOwner = post.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isFaculty = req.user.role === "faculty";
    if (!isOwner && !isAdmin && !isFaculty) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post." });
    }
    if (isFaculty && post.role === "admin") {
      return res
        .status(403)
        .json({ message: "Faculty cannot delete admin posts." });
    }
    await post.deleteOne();

    const io = req.app.get("io");
    if (io) io.emit("delete-post", req.params.id);

    return res.status(200).json({ message: "Post deleted." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete post.", error: error.message });
  }
};

/* ── Toggle pin (admin only) ──────────────────────────────────────────────── */

export const togglePin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    post.isPinned = !post.isPinned;
    await post.save();

    const io = req.app.get("io");
    if (io) io.emit("update-post", toPostResponse(post));

    return res.status(200).json({
      message: post.isPinned ? "Post pinned." : "Post unpinned.",
      post: toPostResponse(post),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to toggle pin.", error: error.message });
  }
};

/* ── React to post (any authenticated user) ───────────────────────────────── */

export const reactToPost = async (req, res) => {
  try {
    const { type } = req.body; // "love" or "thumbsup"
    if (!["love", "thumbsup"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const userId = req.user._id;
    const opposite = type === "love" ? "thumbsup" : "love";

    // Remove from opposite reaction if present
    post.reactions[opposite] = post.reactions[opposite].filter(
      (id) => id.toString() !== userId.toString(),
    );

    // Toggle current reaction
    const idx = post.reactions[type].findIndex(
      (id) => id.toString() === userId.toString(),
    );
    if (idx > -1) {
      post.reactions[type].splice(idx, 1);
    } else {
      post.reactions[type].push(userId);
    }

    await post.save();

    const io = req.app.get("io");
    if (io) io.emit("update-post", toPostResponse(post));

    return res.status(200).json({ post: toPostResponse(post) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to react.", error: error.message });
  }
};

/* ── Vote on poll option (any authenticated user, one vote per poll) ──────── */

export const voteOnPoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const post = await Post.findById(req.params.id);
    if (
      !post ||
      !post.poll ||
      !post.poll.question ||
      !post.poll.options?.length
    )
      return res.status(404).json({ message: "Poll not found." });

    const userId = req.user._id.toString();

    // Remove existing vote from all options
    for (const option of post.poll.options) {
      option.votes = option.votes.filter((id) => id.toString() !== userId);
    }

    // Add vote to selected option
    const target =
      post.poll.options.id(optionId) ||
      post.poll.options.find((o) => o._id.toString() === optionId);
    if (!target)
      return res.status(400).json({ message: "Invalid poll option." });
    target.votes.push(req.user._id);

    await post.save();

    const io = req.app.get("io");
    if (io) io.emit("update-post", toPostResponse(post));

    return res.status(200).json({ post: toPostResponse(post) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to vote.", error: error.message });
  }
};
