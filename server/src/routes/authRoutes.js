import express from "express";
import {
  checkEnrollmentNumber,
  createStaffAccount,
  deactivateUser,
  getAllUsers,
  login,
  logout,
  me,
  reactivateUser,
  register,
  resendSetupEmail,
  setPassword,
  verifySetupToken,
} from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Enrollment number live-lookup (used by the register form)
router.get("/enrollment/:number", checkEnrollmentNumber);

// Faculty "Set Your Password" flow
router.get("/verify-setup-token/:token", verifySetupToken);
router.post("/set-password/:token", setPassword);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get("/me", protect, me);

// ── Admin only ────────────────────────────────────────────────────────────────
router.post("/staff", protect, authorizeRoles("admin"), createStaffAccount);
router.post("/staff/:id/resend-setup", protect, authorizeRoles("admin"), resendSetupEmail);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/users/:id/deactivate", protect, authorizeRoles("admin"), deactivateUser);
router.patch("/users/:id/reactivate", protect, authorizeRoles("admin"), reactivateUser);

export default router;
