import imageKit from "../config/imagekit.js";
import { getReceiverSocketID, io } from "../config/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// export const getUsersForSideBar = async (req, res) => {
//   try {
//     const loggedInUser = req.user._id;

//     const { search } = req.query;

//     let userQuery = { _id: { $ne: loggedInUser } };

//     if (search) {
//       userQuery.$or = [
//         { fullName: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//       ];
//     }

//     const users = await User.find(userQuery).select("-password");

//     let groupQuery = {
//       members: loggedInUser,
//     };

//     if (search) {
//       groupQuery.groupName = { $regex: search, $options: "i" };
//     }

//     const groups = await Group.find(groupQuery)
//       .populate("admin", "fullName")
//       .select("-message");

//     const response = {
//       users,
//       groups,
//     };

//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const { search } = req.query;

    let query = { _id: { $ne: loggedInUser } };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const user = await User.find(query).select("-password");

    if (user.length > 0) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: userChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userChatId },
        { senderId: userChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};




export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    let fileUrl = "";
    let videoUrl = "";
    let imagekitFileId = "";
    let filekitFileId = "";
    let videoKitFileId = "";

    // Handle image upload
    if (req.files && req.files["image"]) {
      const imageFile = req.files["image"][0];
      if (!imageFile.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Invalid image file type" });
      }
      const uploadResponse = await imageKit.upload({
        file: imageFile.buffer,
        fileName: imageFile.originalname,
        folder: "/chat_app",
      });
      imageUrl = uploadResponse.url;
      imagekitFileId = uploadResponse.fileId;
    }

    // Handle file upload (e.g., PDF)
    if (req.files && req.files["file"]) {
      const file = req.files["file"][0];
      const uploadResponse = await imageKit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "/chat_app",
      });
      fileUrl = uploadResponse.url;
      filekitFileId = uploadResponse.fileId;
    }

    // Handle video upload
    if (req.files && req.files["video"]) {
      const videoFile = req.files["video"][0];
      if (!videoFile.mimetype.startsWith("video/")) {
        return res.status(400).json({ message: "Invalid video file type" });
      }
      const uploadResponse = await imageKit.upload({
        file: videoFile.buffer,
        fileName: videoFile.originalname,
        folder: "/chat_app",
      });
      videoUrl = uploadResponse.url;
      videoKitFileId = uploadResponse.fileId;
    }

    // Check if the message is empty
    if (!text?.trim() && !imageUrl && !fileUrl && !videoUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Create the new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl || "",
      imagekitFileId: imagekitFileId || "",
      file: fileUrl || "",
      filekitFileId: filekitFileId || "",
      videos: videoUrl || "", 
      videoKitFileId: videoKitFileId || "",
    });

    // Emit the new message to the receiver via Socket.IO
    const receiverSocketId = getReceiverSocketID(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

   
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: "You can only delete your own messages" 
      });
    }

   
    if (message.imagekitFileId) {
      try {
        await imageKit.deleteFile(message.imagekitFileId);
      } catch (error) {
        console.error("Failed to delete image from ImageKit:", error);
      }
    }

    if (message.videoKitFileId) {
      try {
        await imageKit.deleteFile(message.videoKitFileId);
      } catch (error) {
        console.error("Failed to delete video from ImageKit:", error);
      }
    }

    if (message.filekitFileId) {
      try {
        await imageKit.deleteFile(message.filekitFileId);
      } catch (error) {
        console.error("Failed to delete file from ImageKit:", error);
      }
    }

    
    await Message.findByIdAndDelete(messageId);

    
    const receiverSocketId = getReceiverSocketID(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { 
        messageId: messageId,
        receiverId: message.receiverId 
      });
    }

    return res.status(200).json({ 
      message: "Message deleted successfully",
      messageId: messageId 
    });

  } catch (error) {
    console.error("Failed to delete message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
