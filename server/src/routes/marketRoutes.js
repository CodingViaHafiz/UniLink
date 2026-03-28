import express from "express";
import { createListing, getApprovedListings, getMyListings, getAllListings, approveListing, deleteListing } from "../controllers/marketController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const upload = createUploader("marketplace", "images");

router.get("/", protect, getApprovedListings);
router.get("/mine", protect, getMyListings);
router.get("/all", protect, authorizeRoles("admin"), getAllListings);
router.post("/", protect, upload.single("image"), createListing);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveListing);
router.delete("/:id", protect, deleteListing);

export default router;
