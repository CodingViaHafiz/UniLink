import Blog from "../models/Blog.js";
import User from "../models/User.js";

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const buildMonthBuckets = (monthsBack = 6) => {
  const buckets = [];
  const now = new Date();

  for (let index = monthsBack; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: `${monthFormatter.format(date)} ${date.getFullYear()}`,
      users: 0,
      blogs: 0,
    });
  }

  return buckets;
};

const findBucketByDate = (buckets, inputDate) => {
  const date = new Date(inputDate);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return buckets.find((bucket) => bucket.key === key);
};

export const getAdminStats = async (_req, res) => {
  try {
    const [totalUsers, totalStudents, totalFaculty, totalAdmins, totalBlogs] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "faculty" }),
        User.countDocuments({ role: "admin" }),
        Blog.countDocuments(),
      ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAdmins,
        totalBlogs,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to load admin stats.", error: error.message });
  }
};

export const getAdminActivity = async (_req, res) => {
  try {
    const buckets = buildMonthBuckets(6);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const [users, blogs] = await Promise.all([
      User.find({ createdAt: { $gte: startDate } }).select("createdAt"),
      Blog.find({ createdAt: { $gte: startDate } }).select("createdAt"),
    ]);

    users.forEach((entry) => {
      const bucket = findBucketByDate(buckets, entry.createdAt);
      if (bucket) bucket.users += 1;
    });

    blogs.forEach((entry) => {
      const bucket = findBucketByDate(buckets, entry.createdAt);
      if (bucket) bucket.blogs += 1;
    });

    const activity = buckets.map((bucket) => ({
      label: bucket.label,
      users: bucket.users,
      blogs: bucket.blogs,
      total: bucket.users + bucket.blogs,
    }));

    return res.status(200).json({ activity });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to load activity data.", error: error.message });
  }
};

export const getRecentAdminActivity = async (_req, res) => {
  try {
    const [recentUsers, recentBlogs] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select("fullName role createdAt"),
      Blog.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select("title role author createdAt"),
    ]);

    const activity = [
      ...recentUsers.map((user) => ({
        id: `user-${user._id}`,
        type: "user",
        title: `${user.fullName} joined as ${user.role}`,
        meta: "User registration",
        createdAt: user.createdAt,
      })),
      ...recentBlogs.map((blog) => ({
        id: `blog-${blog._id}`,
        type: "blog",
        title: `${blog.author} published "${blog.title}"`,
        meta: `${blog.role} blog`,
        createdAt: blog.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ activity: activity.slice(0, 6) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load recent admin activity.",
      error: error.message,
    });
  }
};

export const getModulePlaceholderData = async (req, res) => {
  const { moduleKey } = req.params;

  return res.status(200).json({
    moduleKey,
    status: "ready-for-integration",
    message: "Backend placeholder endpoint is active for this admin module.",
  });
};

export const prepareUploadStructure = async (req, res) => {
  const { resourceType } = req.params;
  const { fileName, mimeType, sizeKb } = req.body || {};

  return res.status(202).json({
    status: "upload-structure-prepared",
    resourceType,
    received: {
      fileName: fileName || null,
      mimeType: mimeType || null,
      sizeKb: sizeKb || null,
    },
    message:
      "Upload endpoint scaffold is ready. File storage integration can be connected next.",
  });
};
