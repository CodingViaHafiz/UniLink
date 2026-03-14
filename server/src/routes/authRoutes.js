import express from "express";
import {
  createStaffAccount,
  deactivateUser,
  getAllUsers,
  login,
  logout,
  me,
  reactivateUser,
  register,
} from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Authenticated routes
router.get("/me", protect, me);

// Admin-only routes
router.post("/staff", protect, authorizeRoles("admin"), createStaffAccount);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.patch("/users/:id/deactivate", protect, authorizeRoles("admin"), deactivateUser);
router.patch("/users/:id/reactivate", protect, authorizeRoles("admin"), reactivateUser);

export default router;
