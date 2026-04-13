import bcrypt from "bcryptjs";
import crypto from "crypto";
import EnrollmentNumber from "../models/EnrollmentNumber.js";
import User from "../models/User.js";
import { sendPasswordResetEmail, sendPasswordSetupEmail, sendVerificationEmail } from "../services/emailService.js";
import { deleteFromImageKit, uploadToImageKit } from "../utils/uploadToImageKit.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/token.js";
import pushNotification from "../utils/pushNotification.js";

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
  currentSemester: user.currentSemester ?? null,
  isActive: user.isActive,
  isPasswordSet: user.isPasswordSet,
  isVerified: user.isVerified,
  profileImage: user.profileImage || null,
  createdAt: user.createdAt,
});

const generateSetupToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

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

    // Generate email verification token (store only the hash in DB)
    const { rawToken: verificationRaw, hashedToken: verificationHashed } = generateSetupToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

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
      isVerified: false,
      verificationToken: verificationHashed,
      verificationTokenExpiry: verificationExpiry,
    });

    // Mark enrollment number as used
    enrolRecord.isUsed = true;
    enrolRecord.usedBy = user._id;
    await enrolRecord.save();

    // Send verification email — rollback if it fails
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyLink = `${clientUrl}/verify-email/${verificationRaw}`;

    try {
      await sendVerificationEmail({ to: user.email, fullName: user.fullName, verifyLink });
    } catch {
      await User.findByIdAndDelete(user._id);
      enrolRecord.isUsed = false;
      enrolRecord.usedBy = null;
      await enrolRecord.save();
      return res.status(500).json({
        message: "Registration failed: could not send the verification email. Please try again.",
      });
    }

    return res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      needsVerification: true,
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

    // Validate password BEFORE revealing account status
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Only after correct password — check verification & active status
    if (user.role === "student" && !user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
        needsVerification: true,
        email: user.email,
      });
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
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordSetupToken: hashedToken,
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

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordSetupToken: hashedToken,
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

// ─── Authenticated: Update own profile ────────────────────────────────────────

export const updateProfile = async (req, res) => {
  try {
    const { fullName, program, batch, department } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (fullName !== undefined) {
      const trimmed = fullName.trim();
      if (trimmed.length < 2 || trimmed.length > 80) {
        return res.status(400).json({ message: "Full name must be between 2 and 80 characters." });
      }
      user.fullName = trimmed;
    }

    if (program !== undefined) user.program = program.trim();
    if (batch !== undefined) user.batch = batch.trim();
    if (department !== undefined) user.department = department.trim().slice(0, 100);

    await user.save();
    return res.status(200).json({ message: "Profile updated.", user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};

// ─── Public: Verify email (student clicks link from email) ────────────────────

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() },
      isVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        message: "This verification link is invalid or has expired.",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Notify all admins that a new student has joined
    const io = req.app.get("io");
    if (io) {
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      admins.forEach(({ _id }) =>
        pushNotification(io, _id, "user_registered",
          "New Student Registered",
          `${user.fullName} (${user.enrollmentNumber}) has joined UniLink — ${user.program}, ${user.batch}.`,
          { userId: user._id.toString() }
        )
      );
    }

    return res.status(200).json({
      message: "Email verified successfully! You can now log in to UniLink.",
    });
  } catch {
    return res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

// ─── Public: Resend verification email ────────────────────────────────────────

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({ message: "If this email is registered, a verification link has been sent." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This email is already verified. You can log in." });
    }

    // Refresh token and expiry (store hash, send raw)
    const { rawToken: verifyRaw, hashedToken: verifyHashed } = generateSetupToken();
    user.verificationToken = verifyHashed;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyLink = `${clientUrl}/verify-email/${verifyRaw}`;

    await sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      verifyLink,
    });

    return res.status(200).json({
      message: "Verification email sent! Please check your inbox.",
    });
  } catch {
    return res.status(500).json({ message: "Failed to resend verification email." });
  }
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
    const { rawToken: setupRaw, hashedToken: setupHashed } = generateSetupToken();
    const setupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const facultyUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: null,
      role: "faculty",
      department: department?.trim() || "",
      isActive: true,
      isPasswordSet: false,
      passwordSetupToken: setupHashed,
      passwordSetupExpiry: setupExpiry,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const setupLink = `${clientUrl}/set-password/${setupRaw}`;

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

    // Refresh the token and expiry (store hash, send raw)
    const { rawToken: setupRaw, hashedToken: setupHashed } = generateSetupToken();
    user.passwordSetupToken = setupHashed;
    user.passwordSetupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const setupLink = `${clientUrl}/set-password/${setupRaw}`;

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

// ─── Public: Forgot password — send reset link ────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond the same way — prevents email enumeration
    const genericMessage = "If this email is registered, a password reset link has been sent.";

    if (!user || !user.isActive) {
      return res.status(200).json({ message: genericMessage });
    }

    // Faculty who never completed setup have no password — no need to reset
    if (!user.isPasswordSet) {
      return res.status(200).json({ message: genericMessage });
    }

    // Generate reset token (store hash in DB, send raw in link)
    const { rawToken: resetRaw, hashedToken: resetHashed } = generateSetupToken();
    user.resetPasswordToken = resetHashed;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password/${resetRaw}`;

    await sendPasswordResetEmail({ to: user.email, fullName: user.fullName, resetLink });

    return res.status(200).json({ message: genericMessage });
  } catch {
    return res.status(500).json({ message: "Failed to process request. Please try again." });
  }
};

// ─── Public: Reset password — validate token and set new password ─────────────

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required." });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "This link is invalid or has expired. Please request a new one." });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now sign in with your new password." });
  } catch {
    return res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};

// ─── Authenticated: Upload profile image ─────────────────────────────────────

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Delete old image from ImageKit if it exists
    await deleteFromImageKit(user.profileImageFileId);

    const { url, fileId } = await uploadToImageKit(
      req.file.buffer,
      req.file.originalname,
      "avatars",
    );

    user.profileImage = url;
    user.profileImageFileId = fileId;
    await user.save();

    return res.status(200).json({
      message: "Profile image updated.",
      user: sanitizeUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Failed to upload image. Please try again." });
  }
};
