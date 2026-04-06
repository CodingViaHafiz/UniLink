import Blog from "../models/Blog.js";
import Program from "../models/Program.js";
import Resource from "../models/Resource.js";
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
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalBlogs,
      totalResources,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      User.countDocuments({ role: "admin" }),
      Blog.countDocuments(),
      Resource.countDocuments(),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAdmins,
        totalBlogs,
        totalResources,
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

    const [users, blogs, resources] = await Promise.all([
      User.find({ createdAt: { $gte: startDate } }).select("createdAt"),
      Blog.find({ createdAt: { $gte: startDate } }).select("createdAt"),
      Resource.find({ createdAt: { $gte: startDate } }).select("createdAt"),
    ]);

    users.forEach((entry) => {
      const bucket = findBucketByDate(buckets, entry.createdAt);
      if (bucket) bucket.users += 1;
    });

    blogs.forEach((entry) => {
      const bucket = findBucketByDate(buckets, entry.createdAt);
      if (bucket) bucket.blogs += 1;
    });

    resources.forEach((entry) => {
      const bucket = findBucketByDate(buckets, entry.createdAt);
      if (bucket) bucket.resources = (bucket.resources || 0) + 1;
    });

    const activity = buckets.map((bucket) => ({
      label: bucket.label,
      users: bucket.users,
      blogs: bucket.blogs,
      resources: bucket.resources || 0,
      total: bucket.users + bucket.blogs + (bucket.resources || 0),
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

// ─── Semester management ──────────────────────────────────────────────────────

// GET /api/admin/semester/preview?programmeCode=BCS&batch=FA21&action=increment
// Returns each student with their computed afterSemester and status ("update" | "skip" | "at_max")
// so the UI can show an accurate before/after breakdown before the admin commits.
export const previewSemesterPromotion = async (req, res) => {
  try {
    const { programmeCode, batch, action, semester } = req.query;
    if (!programmeCode?.trim() || !batch?.trim()) {
      return res
        .status(400)
        .json({ message: "programmeCode and batch are required." });
    }

    // Fetch the programme so we know the ceiling (totalSemesters)
    const programme = await Program.findOne({
      code: { $regex: new RegExp(`^${programmeCode.trim()}$`, "i") },
    })
      .select("totalSemesters")
      .lean();
    const maxSemester = programme?.totalSemesters ?? 12;

    const students = await User.find({
      role: "student",
      program: { $regex: new RegExp(`^${programmeCode.trim()}$`, "i") },
      batch: { $regex: new RegExp(`^${batch.trim()}$`, "i") },
    })
      .select("fullName enrollmentNumber currentSemester")
      .sort({ fullName: 1 })
      .lean();

    const targetSem = action === "set" ? Number(semester) || null : null;

    return res.status(200).json({
      students: students.map((s) => {
        const cur = s.currentSemester ?? null;
        let afterSemester = null;
        let status = "update";

        if (action === "set") {
          afterSemester = targetSem;
          status = "update";
        } else if (action === "increment") {
          if (cur == null) {
            status = "skip";
          } else if (cur >= maxSemester) {
            afterSemester = cur;
            status = "at_max";
          } else {
            afterSemester = cur + 1;
            status = "update";
          }
        }

        return {
          id: s._id,
          fullName: s.fullName,
          enrollmentNumber: s.enrollmentNumber,
          currentSemester: cur,
          afterSemester,
          status,
        };
      }),
      count: students.length,
      maxSemester,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Preview failed.", error: error.message });
  }
};

// PATCH /api/admin/semester/promote
// action "set"       → set every matching student to { semester }
// action "increment" → bump every student who already has a semester assigned (+1)
export const promoteSemester = async (req, res) => {
  try {
    const { programmeCode, batch, action, semester } = req.body;

    if (!programmeCode?.trim() || !batch?.trim()) {
      return res
        .status(400)
        .json({ message: "programmeCode and batch are required." });
    }
    if (!["set", "increment"].includes(action)) {
      return res
        .status(400)
        .json({ message: "action must be 'set' or 'increment'." });
    }
    if (action === "set") {
      const sem = Number(semester);
      if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
        return res
          .status(400)
          .json({ message: "semester must be an integer between 1 and 12." });
      }
    }

    const baseFilter = {
      role: "student",
      program: { $regex: new RegExp(`^${programmeCode.trim()}$`, "i") },
      batch: { $regex: new RegExp(`^${batch.trim()}$`, "i") },
    };

    let result;

    if (action === "set") {
      result = await User.updateMany(baseFilter, {
        $set: { currentSemester: Number(semester) },
      });
    } else {
      // Look up the programme's ceiling so we never promote past totalSemesters
      const programme = await Program.findOne({
        code: { $regex: new RegExp(`^${programmeCode.trim()}$`, "i") },
      })
        .select("totalSemesters")
        .lean();
      const maxSem = programme?.totalSemesters ?? 12;

      // Only update students who have a semester assigned and are not yet at the programme ceiling
      const filter = { ...baseFilter, currentSemester: { $ne: null, $gte: 1, $lt: maxSem } };
      result = await User.updateMany(filter, [
        { $set: { currentSemester: { $add: ["$currentSemester", 1] } } },
      ]);
    }

    return res.status(200).json({
      message: `${result.modifiedCount} student(s) promoted successfully.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Promotion failed.", error: error.message });
  }
};

// GET /api/admin/programmes  (lightweight list for admin dropdowns)
export const getProgrammeList = async (_req, res) => {
  try {
    const programmes = await Program.find()
      .select("name code totalSemesters")
      .sort({ code: 1 })
      .lean();

    return res.status(200).json({
      programmes: programmes.map((p) => ({
        id: p._id,
        name: p.name,
        code: p.code,
        totalSemesters: p.totalSemesters,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch programmes.", error: error.message });
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
