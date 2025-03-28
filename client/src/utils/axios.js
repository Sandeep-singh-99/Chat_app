import axios from 'axios';

const VITE_APP_BACKEND_URL = import.meta.env.VITE_API_URL

export const axiosInstance = axios.create({
    baseURL: `${VITE_APP_BACKEND_URL}/api`,
    withCredentials: true,
})