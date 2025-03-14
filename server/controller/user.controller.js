import imageKit from "../config/imagekit.js"
import { generateToken } from "../config/utils.js"
import User from "../models/user.model.js"

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' })
        }

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const newUser = await User.create({ fullName, email, password })
        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({ message: 'User created successfully' })
        } else {
            res.status(400).json({ message: 'Invalid user data' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        const isPasswordMatch = await user.comparePassword(password)
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        generateToken(user._id, res)
        await user.save()
        res.status(200).json({ message: 'User logged in successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie('token')
        res.status(200).json({ message: 'User logged out successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateProfile = async (req, res) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ message: 'Please select an image' })
        }

        const uploadResponse = await imageKit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: '/chat_app'
        })

        const profileImage = await User.findById(req.user._id)
        if (profileImage.profilePic) {
            await imageKit.deleteFile(profileImage.imagekitFileId)
        }

        await User.findByIdAndUpdate(req.user._id, {
            profilePic: uploadResponse.url,
            imagekitFileId: uploadResponse.fileId
        })

        res.status(200).json({ message: 'Profile image updated successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}