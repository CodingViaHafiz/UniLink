import express from "express";
import rateLimit from "express-rate-limit";
import {
  checkEnrollmentNumber,
  createStaffAccount,
  deactivateUser,
  forgotPassword,
  getAllUsers,
  login,
  logout,
  me,
  reactivateUser,
  register,
  resendSetupEmail,
  resendVerification,
  resetPassword,
  setPassword,
  updateProfile,
  uploadProfileImage,
  verifyEmail,
  verifySetupToken,
} from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const avatarUpload = createUploader("avatars", "images");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many resend requests. Please wait before trying again." },
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many password reset requests. Please wait before trying again." },
});

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

// Enrollment number live-lookup (used by the register form)
router.get("/enrollment/:number", checkEnrollmentNumber);

// Faculty "Set Your Password" flow
router.get("/verify-setup-token/:token", verifySetupToken);
router.post("/set-password/:token", setPassword);

// Student email verification
router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendLimiter, resendVerification);

// Forgot / reset password (all roles)
router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
router.post("/profile/image", protect, avatarUpload.single("avatar"), uploadProfileImage);

// ── Admin only ────────────────────────────────────────────────────────────────
router.post("/staff", protect, authorizeRoles("admin"), createStaffAccount);
router.post("/staff/:id/resend-setup", protect, authorizeRoles("admin"), resendSetupEmail);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/users/:id/deactivate", protect, authorizeRoles("admin"), deactivateUser);
router.patch("/users/:id/reactivate", protect, authorizeRoles("admin"), reactivateUser);

export default router;
