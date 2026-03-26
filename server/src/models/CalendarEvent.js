import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["exam", "deadline", "project", "event", "holiday"],
      default: "event",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("CalendarEvent", calendarEventSchema);
