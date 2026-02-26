import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  clearAuthCookie,
  setAuthCookie,
  signToken,
} from "../utils/token.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required." });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role:
        role && ["student", "faculty", "admin"].includes(role)
          ? role
          : "student",
    });

    const token = signToken({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Registration failed.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed.", error: error.message });
  }
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out." });
};

export const me = async (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) });
};
