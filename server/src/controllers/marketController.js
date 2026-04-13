import MarketListing from "../models/MarketListing.js";
import User from "../models/User.js";
import { uploadToImageKit } from "../utils/uploadToImageKit.js";
import pushNotification from "../utils/pushNotification.js";

const toResponse = (item) => ({
  id: item._id,
  title: item.title,
  description: item.description,
  price: item.price,
  category: item.category,
  contact: item.contact,
  imageUrl: item.imageUrl || "",
  status: item.status,
  authorName: item.authorName,
  createdBy: item.createdBy,
  createdAt: item.createdAt,
});

export const createListing = async (req, res) => {
  try {
    const { title, description, price, category, contact } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (!price || !price.trim()) {
      return res.status(400).json({ message: "Price is required." });
    }

    if (!contact || !contact.trim()) {
      return res.status(400).json({ message: "Contact is required." });
    }

    const listing = await MarketListing.create({
      title,
      description: description || "",
      price,
      category: category || "other",
      contact,
      imageUrl: req.file ? (await uploadToImageKit(req.file.buffer, req.file.originalname, "marketplace")).url : "",
      status: "pending",
      createdBy: req.user._id,
      authorName: req.user.fullName,
    });

    // Notify all admins
    const io = req.app.get("io");
    if (io) {
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      admins.forEach(({ _id }) =>
        pushNotification(io, _id, "marketplace_new",
          "New Marketplace Listing",
          `${req.user.fullName} listed "${listing.title}" — pending approval.`,
          { listingId: listing._id.toString() }
        )
      );
    }

    return res.status(201).json({
      message: "Listing created successfully. It will be visible after admin approval.",
      listing: toResponse(listing),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to create listing.", error: error.message });
  }
};

export const getApprovedListings = async (req, res) => {
  try {
    const listings = await MarketListing.find({ status: "approved" }).sort({
      createdAt: -1,
    });
    return res
      .status(200)
      .json({ listings: listings.map((l) => toResponse(l)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch listings.", error: error.message });
  }
};

export const getMyListings = async (req, res) => {
  try {
    const listings = await MarketListing.find({ createdBy: req.user._id }).sort(
      { createdAt: -1 },
    );
    return res
      .status(200)
      .json({ listings: listings.map((l) => toResponse(l)) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch your listings.",
      error: error.message,
    });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listings = await MarketListing.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ listings: listings.map((l) => toResponse(l)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch all listings.", error: error.message });
  }
};

export const approveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'." });
    }

    const listing = await MarketListing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    listing.status = status;
    await listing.save();

    // Notify the listing owner
    const io = req.app.get("io");
    if (io) {
      const isApproved = status === "approved";
      pushNotification(
        io, listing.createdBy,
        isApproved ? "marketplace_approved" : "marketplace_rejected",
        isApproved ? "Listing Approved" : "Listing Rejected",
        isApproved
          ? `Your listing "${listing.title}" is now live on the Marketplace.`
          : `Your listing "${listing.title}" was not approved.`,
        { listingId: listing._id.toString() }
      );
    }

    return res.status(200).json({
      message: `Listing ${status} successfully.`,
      listing: toResponse(listing),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update listing.", error: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await MarketListing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const isOwner = listing.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You do not have permission to delete this listing.",
      });
    }

    await listing.deleteOne();
    return res.status(200).json({ message: "Listing deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete listing.", error: error.message });
  }
};
