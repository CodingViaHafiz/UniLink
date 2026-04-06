import cookie from "cookie";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import { verifyToken } from "./utils/token.js";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server and attach Socket.io
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
      },
    });

    // Authenticate every socket connection using the same httpOnly cookie
    io.use(async (socket, next) => {
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.token;
        if (!token) return next(new Error("Unauthorized"));

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select("-password");
        if (!user || !user.isActive) return next(new Error("Unauthorized"));

        socket.user = user;
        next();
      } catch {
        next(new Error("Unauthorized"));
      }
    });

    // Make io accessible in controllers via req.app.get("io")
    app.set("io", io);

    // Track online users + manage rooms
    io.on("connection", (socket) => {
      io.emit("online-count", io.engine.clientsCount);

      // ── Personal notification room (every authenticated user) ─────────────
      socket.join(`user:${socket.user._id}`);

      // ── Admin: auto-join support inbox room ───────────────────────────────
      if (socket.user.role === "admin") {
        socket.join("support:admin");
      }

      // ── Programme rooms (class messages) ─────────────────────────────────
      socket.on("join-programme-room", ({ programmeId }) => {
        if (!programmeId) return;
        socket.join(`programme:${programmeId}`);
      });

      socket.on("leave-programme-room", ({ programmeId }) => {
        if (!programmeId) return;
        socket.leave(`programme:${programmeId}`);
      });

      // ── Support chat rooms (per-conversation) ─────────────────────────────
      socket.on("join-support-room", ({ conversationId }) => {
        if (!conversationId) return;
        socket.join(`support:${conversationId}`);
      });

      socket.on("leave-support-room", ({ conversationId }) => {
        if (!conversationId) return;
        socket.leave(`support:${conversationId}`);
      });

      socket.on("disconnect", () => {
        io.emit("online-count", io.engine.clientsCount);
      });
    });

    httpServer.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
