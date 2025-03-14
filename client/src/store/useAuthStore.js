import { create } from 'zustand'
import { axiosInstance } from '../utils/axios'
import toast from 'react-hot-toast'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSignUp: false,
    isLoggedIn: false,
    isCheckingAuth: true,
    isUpdatingProfileImage: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check-auth')
            set({ authUser: response.data})
        } catch (error) {
            set({ isCheckingAuth: false })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        set({ isSignUp: true })
        try {
            const response = await axiosInstance.post('/auth/register', data)
            toast.success("Signed up successfully")
            set({ authUser: response.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isSignUp: false })
        }
    },

    login: async (data) => {
        set({ isLoggedIn: true })
        try {
            const response = await axiosInstance.post('/auth/login', data)
            set({ authUser: response.data })
            toast.success('Logged in successfully')
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggedIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout')
            set({ authUser: null })
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfileImage: async (data) => {
        set({ isUpdatingProfileImage: true })
        try {
            const response = await axiosInstance.put('/auth/update-profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            set({ authUser: response.data.updateUserProfile })
            toast.success(response.data.message)
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfileImage: false })
        }
    }
}))