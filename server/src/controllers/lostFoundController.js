import LostFoundItem from "../models/LostFoundItem.js";
import User from "../models/User.js";
import { uploadToImageKit } from "../utils/uploadToImageKit.js";
import pushNotification from "../utils/pushNotification.js";

const toResponse = (item) => ({
  id: item._id,
  title: item.title,
  description: item.description,
  type: item.type,
  location: item.location,
  date: item.date,
  contact: item.contact,
  imageUrl: item.imageUrl || "",
  status: item.status,
  authorName: item.authorName,
  createdBy: item.createdBy,
  createdAt: item.createdAt,
});

export const createItem = async (req, res) => {
  try {
    const { title, description, type, location, date, contact } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (!type || !["lost", "found"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type must be 'lost' or 'found'." });
    }

    if (!contact || !contact.trim()) {
      return res.status(400).json({ message: "Contact is required." });
    }

    const item = await LostFoundItem.create({
      title,
      description: description || "",
      type,
      location: location || "",
      date: date || undefined,
      contact,
      imageUrl: req.file ? (await uploadToImageKit(req.file.buffer, req.file.originalname, "lostfound")).url : "",
      status: "pending",
      createdBy: req.user._id,
      authorName: req.user.fullName,
    });

    // Notify all admins
    const io = req.app.get("io");
    if (io) {
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      admins.forEach(({ _id }) =>
        pushNotification(io, _id, "lostfound_new",
          "New Lost & Found Report",
          `${req.user.fullName} reported a ${item.type} item: "${item.title}".`,
          { itemId: item._id.toString() }
        )
      );
    }

    return res.status(201).json({
      message: "Item reported successfully. It will be visible after admin approval.",
      item: toResponse(item),
    });
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return res
      .status(status)
      .json({ message: "Failed to create item.", error: error.message });
  }
};

export const getApprovedItems = async (req, res) => {
  try {
    const items = await LostFoundItem.find({
      status: { $in: ["approved", "resolved"] },
    }).sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ items: items.map((i) => toResponse(i)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch items.", error: error.message });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const items = await LostFoundItem.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ items: items.map((i) => toResponse(i)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch your items.", error: error.message });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await LostFoundItem.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ items: items.map((i) => toResponse(i)) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch all items.", error: error.message });
  }
};

export const approveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'approved' or 'rejected'." });
    }

    const item = await LostFoundItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    item.status = status;
    await item.save();

    // Notify the item owner
    const io = req.app.get("io");
    if (io) {
      const isApproved = status === "approved";
      pushNotification(
        io, item.createdBy,
        isApproved ? "lostfound_approved" : "lostfound_rejected",
        isApproved ? "Lost & Found Post Approved" : "Lost & Found Post Rejected",
        isApproved
          ? `Your report "${item.title}" is now visible on Lost & Found.`
          : `Your report "${item.title}" was not approved.`,
        { itemId: item._id.toString() }
      );
    }

    return res.status(200).json({
      message: `Item ${status} successfully.`,
      item: toResponse(item),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update item.", error: error.message });
  }
};

export const resolveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFoundItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const isOwner = item.createdBy?.toString() === req.user._id.toString();

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Only the owner can mark this item as resolved." });
    }

    item.status = "resolved";
    await item.save();

    return res.status(200).json({
      message: "Item marked as resolved.",
      item: toResponse(item),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to resolve item.", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFoundItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const isOwner = item.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this item." });
    }

    await item.deleteOne();
    return res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete item.", error: error.message });
  }
};
