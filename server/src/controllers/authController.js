import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/token.js";

// ─── Validation helpers ───────────────────────────────────────────────────────

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password rules (production-level):
 *  - At least 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character
 */
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
  return null;
};

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// ─── Public: Student self-registration ───────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { fullName, email, password, department } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 80) {
      return res.status(400).json({ message: "Full name must be between 2 and 80 characters." });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      department: department?.trim() || "",
    });

    const token = signToken({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// ─── Public: Login (all roles) ────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact the administrator.",
      });
    }

    const token = signToken({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ─── Authenticated: Logout ────────────────────────────────────────────────────

export const logout = (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out successfully." });
};

// ─── Authenticated: Get current user ─────────────────────────────────────────

export const me = (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) });
};

// ─── Admin only: Create a staff account (faculty or admin) ───────────────────

export const createStaffAccount = async (req, res) => {
  try {
    const { fullName, email, password, role, department } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ message: "Full name, email, password, and role are required." });
    }

    if (!["faculty", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'faculty' or 'admin'." });
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 80) {
      return res.status(400).json({ message: "Full name must be between 2 and 80 characters." });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const staff = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department: department?.trim() || "",
      isActive: true,
    });

    return res.status(201).json({
      message: `${role === "faculty" ? "Faculty" : "Admin"} account created successfully.`,
      user: sanitizeUser(staff),
    });
  } catch {
    return res.status(500).json({ message: "Failed to create account. Please try again." });
  }
};

// ─── Admin only: Get all users (with optional filters) ───────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};

    if (role && ["student", "faculty", "admin"].includes(role)) {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({ users: users.map(sanitizeUser) });
  } catch {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
};

// ─── Admin only: Deactivate a user account ───────────────────────────────────

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: "This account is already deactivated." });
    }

    user.isActive = false;
    await user.save();

    return res.status(200).json({
      message: `Account for ${user.fullName} has been deactivated.`,
      user: sanitizeUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Failed to deactivate account." });
  }
};

// ─── Admin only: Reactivate a user account ───────────────────────────────────

export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isActive) {
      return res.status(400).json({ message: "This account is already active." });
    }

    user.isActive = true;
    await user.save();

    return res.status(200).json({
      message: `Account for ${user.fullName} has been reactivated.`,
      user: sanitizeUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Failed to reactivate account." });
  }
};
