import Resource from "../models/Resource.js";
import { uploadToImageKit } from "../utils/uploadToImageKit.js";

const allowedTypes = new Set(["notes", "past-papers", "timetable"]);

const toResourceResponse = (resource) => ({
  id: resource._id,
  title: resource.title,
  description: resource.description,
  fileUrl: resource.fileUrl || "",
  type: resource.type,
  uploadedBy: resource.uploadedByName,
  role: resource.role,
  createdAt: resource.createdAt,
});

export const createResource = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const file = req.file;

    if (!title || !type || !file) {
      return res.status(400).json({ message: "Title, type, and file are required." });
    }

    if (!allowedTypes.has(type)) {
      return res.status(400).json({ message: "Invalid resource type." });
    }

    const resource = await Resource.create({
      title,
      description: description || "",
      type,
      fileUrl: (await uploadToImageKit(file.buffer, file.originalname, "resources")).url,
      uploadedBy: req.user._id,
      uploadedByName: req.user.fullName,
      role: req.user.role,
    });

    return res.status(201).json({
      message: "Resource uploaded successfully.",
      resource: toResourceResponse(resource),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload resource.", error: error.message });
  }
};

export const getResources = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) {
      if (!allowedTypes.has(type)) {
        return res.status(400).json({ message: "Invalid resource type." });
      }
      query.type = type;
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ resources: resources.map((resource) => toResourceResponse(resource)) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch resources.", error: error.message });
  }
};

export const getResourcesByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!allowedTypes.has(type)) {
      return res.status(400).json({ message: "Invalid resource type." });
    }

    const resources = await Resource.find({ type }).sort({ createdAt: -1 });
    return res.status(200).json({ resources: resources.map((resource) => toResourceResponse(resource)) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch resources.", error: error.message });
  }
};

export const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ resources: resources.map((resource) => toResourceResponse(resource)) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your resources.", error: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You do not have permission to edit this resource." });
    }

    if (type && !allowedTypes.has(type)) {
      return res.status(400).json({ message: "Invalid resource type." });
    }

    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (type) resource.type = type;
    if (req.file) {
      resource.fileUrl = (await uploadToImageKit(req.file.buffer, req.file.originalname, "resources")).url;
    }

    await resource.save();

    return res.status(200).json({
      message: "Resource updated successfully.",
      resource: toResourceResponse(resource),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update resource.", error: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You do not have permission to delete this resource." });
    }

    await resource.deleteOne();
    return res.status(200).json({ message: "Resource deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete resource.", error: error.message });
  }
};
