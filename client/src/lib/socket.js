import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? new URL(import.meta.env.VITE_API_BASE_URL).origin
  : "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
