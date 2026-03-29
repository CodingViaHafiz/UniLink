import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import path from "path";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import hostelRoutes from "./routes/hostelRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "unilink-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/marketplace", marketRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/programs", programRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large. Maximum allowed size exceeded." });
    }
    // LIMIT_UNEXPECTED_FILE is reused for invalid mime type (see upload.js)
    return res.status(400).json({ message: err.field || "Invalid file upload." });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

export default app;
