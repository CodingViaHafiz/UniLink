import mongoose from "mongoose";

/**
 * Enrollment numbers are seeded by admin before the semester.
 * Students must provide a valid, unused enrollment number to register.
 * Format example: FA21-BCS-001  (Batch-Program-Sequence)
 */
const enrollmentNumberSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      // e.g. "FA21", "SP22"
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const EnrollmentNumber = mongoose.model("EnrollmentNumber", enrollmentNumberSchema);

export default EnrollmentNumber;
