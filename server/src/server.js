import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";

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

    // Make io accessible in controllers via req.app.get("io")
    app.set("io", io);

    // Track online users
    io.on("connection", (socket) => {
      io.emit("online-count", io.engine.clientsCount);

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
