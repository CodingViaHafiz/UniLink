import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Blog from "../models/Blog.js";
import Hostel from "../models/Hostel.js";
import LostFoundItem from "../models/LostFoundItem.js";
import MarketListing from "../models/MarketListing.js";
import Resource from "../models/Resource.js";
import ClassMessage from "../models/ClassMessage.js";

export const cleanupImageKitData = async () => {
  try {
    const imagekitRegex = /imagekit/i;

    // 1. Users
    const userRes = await User.updateMany(
      { profileImage: imagekitRegex },
      { $set: { profileImage: null, s3Key: null }, $unset: { profileImageFileId: 1 } }
    );

    // 2. Posts
    const postRes = await Post.updateMany(
      { imageUrl: imagekitRegex },
      { $set: { imageUrl: null, s3Key: null } }
    );

    // 3. Blogs
    const blogRes = await Blog.updateMany(
      { imageUrl: imagekitRegex },
      { $set: { imageUrl: "", s3Key: null } }
    );

    // 4. Hostels
    const hostelRes = await Hostel.updateMany(
      { imageUrl: imagekitRegex },
      { $set: { imageUrl: "", s3Key: null } }
    );

    // 5. Lost & Found
    const lostRes = await LostFoundItem.updateMany(
      { imageUrl: imagekitRegex },
      { $set: { imageUrl: "", s3Key: null } }
    );

    // 6. Market Listings
    const marketRes = await MarketListing.updateMany(
      { imageUrl: imagekitRegex },
      { $set: { imageUrl: "", s3Key: null } }
    );

    // 7. Class Messages
    const msgRes = await ClassMessage.updateMany(
      { attachmentUrl: imagekitRegex },
      { $set: { attachmentUrl: null, attachmentName: null, s3Key: null } }
    );

    console.log("[Data Cleanup] Old ImageKit references cleaned up:", {
      usersModified: userRes.modifiedCount,
      postsModified: postRes.modifiedCount,
      blogsModified: blogRes.modifiedCount,
      hostelsModified: hostelRes.modifiedCount,
      lostFoundModified: lostRes.modifiedCount,
      marketModified: marketRes.modifiedCount,
      classMessagesModified: msgRes.modifiedCount,
    });
  } catch (err) {
    console.error("[Data Cleanup Error]:", err.message);
  }
};

// Run standalone if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI missing");
    process.exit(1);
  }
  mongoose.connect(mongoUri).then(async () => {
    console.log("Connected to MongoDB for ImageKit cleanup...");
    await cleanupImageKitData();
    await mongoose.disconnect();
    console.log("Cleanup complete!");
    process.exit(0);
  });
}
