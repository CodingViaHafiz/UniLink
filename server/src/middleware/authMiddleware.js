import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: missing token." });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: invalid token." });
  }
};
