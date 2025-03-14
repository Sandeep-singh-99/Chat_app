import express from 'express';
import { checkAuth, login, logout, register, updateProfile } from '../controller/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();


router.route('/login').post(login)

router.route('/register').post(register)

router.route('/logout').post(logout)

router.route('/update-profile').put(authMiddleware, upload.single('image'), updateProfile)

router.route('/check-auth').get(authMiddleware, checkAuth)

export default router;