import express from "express";
import { createItem, getApprovedItems, getMyItems, getAllItems, approveItem, resolveItem, deleteItem } from "../controllers/lostFoundController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const upload = createUploader("lostfound", "images");

router.get("/", protect, getApprovedItems);
router.get("/mine", protect, getMyItems);
router.get("/all", protect, authorizeRoles("admin"), getAllItems);
router.post("/", protect, upload.single("image"), createItem);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveItem);
router.patch("/:id/resolve", protect, resolveItem);
router.delete("/:id", protect, deleteItem);

export default router;
