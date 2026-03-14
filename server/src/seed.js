/**
 * Seed script — creates the first admin account.
 * Run from the server/ directory:  node src/seed.js
 */

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const ADMIN = {
  fullName: "Super Admin",
  email: "how@unilink.com",
  password: "Admin@12345",
  role: "admin",
  department: "",
  isActive: true,
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Remove any existing doc with this email to avoid conflicts
    await User.deleteOne({ email: ADMIN.email });

    const hashedPassword = await bcrypt.hash(ADMIN.password, 12);
    await User.create({ ...ADMIN, password: hashedPassword });

    console.log("─────────────────────────────────");
    console.log("Admin account created.");
    console.log("  Email   :", ADMIN.email);
    console.log("  Password:", ADMIN.password);
    console.log("─────────────────────────────────");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
