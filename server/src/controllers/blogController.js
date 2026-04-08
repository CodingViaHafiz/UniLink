import Blog from "../models/Blog.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import { uploadToImageKit } from "../utils/uploadToImageKit.js";

const toBlogResponse = (blog) => ({
  id: blog._id,
  title: blog.title,
  content: blog.content,
  author: blog.author,
  authorId: blog.authorId,
  role: blog.role,
  category: blog.category || "general",
  imageUrl: blog.imageUrl || "",
  createdAt: blog.createdAt,
});

export const createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    if (title.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Title must be at least 2 characters long." });
    }

    if (content.trim().length < 20) {
      return res
        .status(400)
        .json({ message: "Content must be at least 20 characters long." });
    }

    const blog = await Blog.create({
      title,
      content,
      author: req.user.fullName,
      authorId: req.user._id,
      role: req.user.role,
      category: category || "general",
      imageUrl: req.file ? (await uploadToImageKit(req.file.buffer, req.file.originalname, "blogs")).url : "",
    });

    return res.status(201).json({
      message: "Blog created successfully.",
      blog: toBlogResponse(blog),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to create blog.", error: error.message });
  }
};

export const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ role: { $in: ["faculty", "admin"] } })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ blogs: blogs.map((b) => toBlogResponse(b)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch blogs.", error: error.message });
  }
};

export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      $or: [{ authorId: req.user._id }, { author: req.user.fullName }],
    })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ blogs: blogs.map((b) => toBlogResponse(b)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch your blogs.", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const isOwner =
      blog.authorId?.toString() === req.user._id.toString() ||
      blog.author === req.user.fullName;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this blog." });
    }

    if (title) {
      if (title.trim().length < 3) {
        return res
          .status(400)
          .json({ message: "Title must be at least 3 characters long." });
      }
      blog.title = title;
    }
    if (content) {
      if (content.trim().length < 20) {
        return res
          .status(400)
          .json({ message: "Content must be at least 20 characters long." });
      }
      blog.content = content;
    }

    await blog.save();

    return res
      .status(200)
      .json({
        message: "Blog updated successfully.",
        blog: toBlogResponse(blog),
      });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to update blog.", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const isOwner =
      blog.authorId?.toString() === req.user._id.toString() ||
      blog.author === req.user.fullName;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this blog." });
    }

    await blog.deleteOne();
    return res.status(200).json({ message: "Blog deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete blog.", error: error.message });
  }
};

export const getPlatformStats = async (_req, res) => {
  try {
    const [totalStudents, totalFaculty, totalBlogs, totalResources] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "faculty" }),
        Blog.countDocuments(),
        Resource.countDocuments(),
      ]);

    return res.status(200).json({
      stats: {
        totalStudents,
        totalFaculty,
        totalBlogs,
        totalResources,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Failed to fetch platform stats.",
        error: error.message,
      });
  }
};
