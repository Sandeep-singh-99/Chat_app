import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { deleteMessage, getMessage, getUsersForSideBar, sendMessage } from '../controller/message.controller.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.route('/users').get(authMiddleware, getUsersForSideBar)

router.route('/chat-message/:id').get(authMiddleware, getMessage)

router.route('/send/:id').post(authMiddleware, upload.fields([{ name: 'image' }, { name: 'file' }, { name: 'video'}]), sendMessage)

router.route('/delete-message/:id').delete(authMiddleware, deleteMessage)

export default router;