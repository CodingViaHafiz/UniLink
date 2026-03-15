import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional — faculty created via "Set Your Password" flow initially have no password
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    // Students only — links account to the seeded enrollment record
    enrollmentNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    program: {
      type: String,
      trim: true,
      default: "",
    },
    batch: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Faculty "Set Your Password" flow
    isPasswordSet: {
      type: Boolean,
      default: true, // true for students/admins; false for newly-invited faculty
    },
    passwordSetupToken: {
      type: String,
      default: null,
    },
    passwordSetupExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
