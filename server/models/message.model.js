import mongoose, { model, Schema } from "mongoose";

const messageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    text: {
        type: String,
    },

    image: {
        type: String,
    },
    videos: {
        type: String,
    },
    videoKitFileId: {
        type: String,
    },

    file: {
        type: String,
    },

    imagekitFileId: {
        type: String,
    },

    filekitFileId: {
        type: String,
    },
},{timestamps: true})

const Message = model('Message', messageSchema)

export default Message