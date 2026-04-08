import Hostel from "../models/Hostel.js";
import { uploadToImageKit } from "../utils/uploadToImageKit.js";

const toHostelResponse = (hostel) => ({
  id: hostel._id,
  name: hostel.name,
  location: hostel.location,
  price: hostel.price,
  contact: hostel.contact,
  description: hostel.description,
  mapUrl: hostel.mapUrl || "",
  imageUrl: hostel.imageUrl || "",
  uploadedBy: hostel.uploadedBy,
  createdAt: hostel.createdAt,
});

// Only allow http/https URLs — blocks javascript: and other dangerous protocols
const isSafeUrl = (url) => !url || /^https?:\/\//i.test(url);

export const createHostel = async (req, res) => {
  try {
    const { name, location, price, contact, description, mapUrl } = req.body;

    if (!name || !location || !price || !contact) {
      return res.status(400).json({ message: "Name, location, price, and contact are required." });
    }

    if (mapUrl && !isSafeUrl(mapUrl)) {
      return res.status(400).json({ message: "Map URL must start with http:// or https://" });
    }

    const hostel = await Hostel.create({
      name,
      location,
      price,
      contact,
      description: description || "",
      mapUrl: mapUrl || "",
      imageUrl: req.file ? (await uploadToImageKit(req.file.buffer, req.file.originalname, "hostels")).url : "",
      uploadedBy: req.user._id,
    });

    return res.status(201).json({
      message: "Hostel added successfully.",
      hostel: toHostelResponse(hostel),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add hostel.", error: error.message });
  }
};

export const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    return res.status(200).json({ hostels: hostels.map((hostel) => toHostelResponse(hostel)) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch hostels.", error: error.message });
  }
};

export const updateHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, price, contact, description, mapUrl } = req.body;

    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found." });
    }

    if (mapUrl !== undefined && !isSafeUrl(mapUrl)) {
      return res.status(400).json({ message: "Map URL must start with http:// or https://" });
    }

    if (name) hostel.name = name;
    if (location) hostel.location = location;
    if (price) hostel.price = price;
    if (contact) hostel.contact = contact;
    if (description !== undefined) hostel.description = description;
    if (mapUrl !== undefined) hostel.mapUrl = mapUrl;
    if (req.file) {
      const { url } = await uploadToImageKit(req.file.buffer, req.file.originalname, "hostels");
      hostel.imageUrl = url;
    }

    await hostel.save();

    return res.status(200).json({
      message: "Hostel updated successfully.",
      hostel: toHostelResponse(hostel),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update hostel.", error: error.message });
  }
};

export const deleteHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await Hostel.findById(id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found." });
    }

    await hostel.deleteOne();
    return res.status(200).json({ message: "Hostel deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete hostel.", error: error.message });
  }
};
