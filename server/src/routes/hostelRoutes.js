import express from "express";
import { createHostel, deleteHostel, getHostels, updateHostel } from "../controllers/hostelController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const upload = createUploader("hostels", "images");

router.get("/", getHostels);
router.post("/", protect, authorizeRoles("admin"), upload.single("image"), createHostel);
router.put("/:id", protect, authorizeRoles("admin"), upload.single("image"), updateHostel);
router.delete("/:id", protect, authorizeRoles("admin"), deleteHostel);

export default router;
