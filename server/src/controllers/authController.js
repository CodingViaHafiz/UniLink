import bcrypt from "bcryptjs";
import crypto from "crypto";
import EnrollmentNumber from "../models/EnrollmentNumber.js";
import User from "../models/User.js";
import { sendPasswordSetupEmail } from "../services/emailService.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/token.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  program: user.program,
  batch: user.batch,
  enrollmentNumber: user.enrollmentNumber,
  isActive: user.isActive,
  isPasswordSet: user.isPasswordSet,
  createdAt: user.createdAt,
});

const generateSetupToken = () => crypto.randomBytes(32).toString("hex");

// ─── Public: Validate enrollment number (for live lookup in the register form) ─

export const checkEnrollmentNumber = async (req, res) => {
  try {
    const number = req.params.number?.toUpperCase().trim();
    if (!number) return res.status(400).json({ message: "Enrollment number is required." });

    const record = await EnrollmentNumber.findOne({ enrollmentNumber: number });
    if (!record) return res.status(404).json({ message: "Enrollment number not found." });
    if (record.isUsed) return res.status(409).json({ message: "This enrollment number is already registered." });

    return res.status(200).json({
      valid: true,
      department: record.department,
      program: record.program,
      batch: record.batch,
    });
  } catch {
    return res.status(500).json({ message: "Lookup failed. Please try again." });
  }
};

// ─── Public: Student self-registration ───────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { fullName, email, password, enrollmentNumber } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password || !enrollmentNumber?.trim()) {
      return res.status(400).json({
        message: "Full name, email, enrollment number, and password are required.",
      });
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 80) {
      return res.status(400).json({ message: "Full name must be between 2 and 80 characters." });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    // Validate enrollment number
    const enrolRecord = await EnrollmentNumber.findOne({
      enrollmentNumber: enrollmentNumber.toUpperCase().trim(),
    });
    if (!enrolRecord) {
      return res.status(404).json({ message: "Enrollment number not found. Contact the administrator." });
    }
    if (enrolRecord.isUsed) {
      return res.status(409).json({ message: "This enrollment number is already registered." });
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
      department: enrolRecord.department,
      program: enrolRecord.program,
      batch: enrolRecord.batch,
      enrollmentNumber: enrolRecord.enrollmentNumber,
      isPasswordSet: true,
    });

    // Mark enrollment number as used
    enrolRecord.isUsed = true;
    enrolRecord.usedBy = user._id;
    await enrolRecord.save();

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

    // Faculty who haven't completed "Set Your Password" flow
    if (!user.isPasswordSet) {
      return res.status(403).json({
        message: "Your account is not yet activated. Please check your email for the password setup link.",
      });
    }

    if (!user.password) {
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

    return res.status(200).json({ message: "Login successful.", user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ─── Public: Verify setup token (faculty checks if their link is still valid) ─

export const verifySetupToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      passwordSetupToken: token,
      passwordSetupExpiry: { $gt: new Date() },
      isPasswordSet: false,
    });

    if (!user) {
      return res.status(400).json({ valid: false, message: "This link is invalid or has expired." });
    }

    return res.status(200).json({ valid: true, fullName: user.fullName, email: user.email });
  } catch {
    return res.status(500).json({ message: "Verification failed." });
  }
};

// ─── Public: Set password (faculty activates account via email link) ──────────

export const setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required." });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const user = await User.findOne({
      passwordSetupToken: token,
      passwordSetupExpiry: { $gt: new Date() },
      isPasswordSet: false,
    });

    if (!user) {
      return res.status(400).json({ message: "This link is invalid or has expired. Ask the admin to resend the setup email." });
    }

    user.password = await bcrypt.hash(password, 12);
    user.isPasswordSet = true;
    user.passwordSetupToken = null;
    user.passwordSetupExpiry = null;
    await user.save();

    const jwtToken = signToken({ id: user._id, role: user.role });
    setAuthCookie(res, jwtToken);

    return res.status(200).json({
      message: "Password set successfully. Welcome to UniLink!",
      user: sanitizeUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Failed to set password. Please try again." });
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

// ─── Admin: Create staff account ──────────────────────────────────────────────
// Faculty  → no password required; system sends "Set Your Password" email
// Admin    → password required (created immediately, active)

export const createStaffAccount = async (req, res) => {
  try {
    const { fullName, email, role, department, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !role) {
      return res.status(400).json({ message: "Full name, email, and role are required." });
    }
    if (!["faculty", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'faculty' or 'admin'." });
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 80) {
      return res.status(400).json({ message: "Full name must be between 2 and 80 characters." });
    }
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // ── Admin account: password required ─────────────────────────────────────
    if (role === "admin") {
      if (!password) return res.status(400).json({ message: "Password is required for admin accounts." });
      const passwordError = validatePassword(password);
      if (passwordError) return res.status(400).json({ message: passwordError });

      const hashedPassword = await bcrypt.hash(password, 12);
      const adminUser = await User.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "admin",
        department: department?.trim() || "",
        isActive: true,
        isPasswordSet: true,
      });

      return res.status(201).json({
        message: "Admin account created successfully.",
        user: sanitizeUser(adminUser),
      });
    }

    // ── Faculty account: email-based setup ───────────────────────────────────
    const setupToken = generateSetupToken();
    const setupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const facultyUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: null,
      role: "faculty",
      department: department?.trim() || "",
      isActive: true,
      isPasswordSet: false,
      passwordSetupToken: setupToken,
      passwordSetupExpiry: setupExpiry,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const setupLink = `${clientUrl}/set-password/${setupToken}`;

    await sendPasswordSetupEmail({
      to: facultyUser.email,
      fullName: facultyUser.fullName,
      setupLink,
    });

    return res.status(201).json({
      message: `Faculty account created. A password setup email has been sent to ${facultyUser.email}.`,
      user: sanitizeUser(facultyUser),
    });
  } catch {
    return res.status(500).json({ message: "Failed to create account. Please try again." });
  }
};

// ─── Admin: Resend setup email ────────────────────────────────────────────────

export const resendSetupEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role !== "faculty") return res.status(400).json({ message: "Only faculty accounts require setup emails." });
    if (user.isPasswordSet) return res.status(400).json({ message: "This faculty member has already set their password." });

    // Refresh the token and expiry
    user.passwordSetupToken = generateSetupToken();
    user.passwordSetupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const setupLink = `${clientUrl}/set-password/${user.passwordSetupToken}`;

    await sendPasswordSetupEmail({ to: user.email, fullName: user.fullName, setupLink });

    return res.status(200).json({ message: `Setup email resent to ${user.email}.` });
  } catch {
    return res.status(500).json({ message: "Failed to resend setup email." });
  }
};

// ─── Admin: Get all users ─────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role && ["student", "faculty", "admin"].includes(role)) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ users: users.map(sanitizeUser) });
  } catch {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
};

// ─── Admin: Deactivate a user ─────────────────────────────────────────────────

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.isActive) return res.status(400).json({ message: "This account is already deactivated." });

    user.isActive = false;
    await user.save();
    return res.status(200).json({ message: `Account for ${user.fullName} has been deactivated.`, user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Failed to deactivate account." });
  }
};

// ─── Admin: Reactivate a user ─────────────────────────────────────────────────

export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isActive) return res.status(400).json({ message: "This account is already active." });

    user.isActive = true;
    await user.save();
    return res.status(200).json({ message: `Account for ${user.fullName} has been reactivated.`, user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Failed to reactivate account." });
  }
};
