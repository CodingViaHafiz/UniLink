import Blog from "../models/Blog.js";
import User from "../models/User.js";

const toBlogResponse = (blog) => ({
  id: blog._id,
  title: blog.title,
  content: blog.content,
  author: blog.author,
  role: blog.role,
  createdAt: blog.createdAt,
});

export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const blog = await Blog.create({
      title,
      content,
      author: req.user.fullName,
      role: req.user.role,
    });

    return res.status(201).json({
      message: "Blog created successfully.",
      blog: toBlogResponse(blog),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create blog.", error: error.message });
  }
};

export const getPublishedBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find({ role: { $in: ["faculty", "admin"] } }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ blogs: blogs.map(toBlogResponse) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blogs.", error: error.message });
  }
};

export const getPlatformStats = async (_req, res) => {
  try {
    const [totalStudents, totalFaculty, totalBlogs] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Blog.countDocuments(),
    ]);

    // Placeholder until a dedicated Course model exists.
    const totalCourses = 24;

    return res.status(200).json({
      stats: {
        totalStudents,
        totalFaculty,
        totalBlogs,
        totalCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch platform stats.", error: error.message });
  }
};
