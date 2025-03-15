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
    let imagekitFileId = "";
    let filekitFileId = "";

    if (req.files && req.files["image"]) {
      const uploadResponse = await imageKit.upload({
        file: req.files["image"][0].buffer,
        fileName: req.files["image"][0].originalname,
        folder: "/chat_app",
      });
      imageUrl = uploadResponse.url;
      imagekitFileId = uploadResponse.fileId;
    }

    if (req.files && req.files["file"]) {
      const uploadResponse = await imageKit.upload({
        file: req.files["file"][0].buffer,
        fileName: req.files["file"][0].originalname,
        folder: "/chat_app",
      });
      fileUrl = uploadResponse.url;
      filekitFileId = uploadResponse.fileId;
    }

    if (!text && !imageUrl && !fileUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl || "",
      imagekitFileId: imagekitFileId || "",
      file: fileUrl || "",
      filekitFileId: filekitFileId || "",
    });

    const receiverSocketId = getReceiverSocketID(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ message: "Internal server error" });
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
