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

    file: {
        type: String,
    },

    imagekitFileId: {
        type: String,
    },

    filekitFileId: {
        type: String,
    },
    
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }
},{timestamps: true})

const Message = model('Message', messageSchema)

export default Message