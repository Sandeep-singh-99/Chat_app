import mongoose, { model, Schema } from "mongoose";

const groupSchema = new Schema({
    groupName: {
        type: String,
        required: true
    },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    message: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
}, {timestamps: true})

const Group = model('Group', groupSchema)

export default Group