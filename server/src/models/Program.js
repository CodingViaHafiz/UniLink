import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  courseCode: { type: String, trim: true, default: "" },
  theoryCredits: { type: Number, default: 3 },
  labCredits: { type: Number, default: 0 },
  type: { type: String, enum: ["core", "elective"], default: "core" },
  order: { type: Number, default: 0 },
});

const semesterSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  courses: [courseSchema],
});

const electiveSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  courseCode: { type: String, trim: true, default: "" },
  theoryCredits: { type: Number, default: 3 },
  labCredits: { type: Number, default: 0 },
});

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    totalSemesters: { type: Number, required: true, min: 1, max: 12 },
    semesters: [semesterSchema],
    electivePool: [electiveSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Program", programSchema);
