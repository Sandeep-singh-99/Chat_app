import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'

import ConnectDB from './config/db.js'
import authRoutes from './router/auth.routes.js'
import messageRoutes from './router/message.routes.js'
import { app, server } from './config/socket.js'


// const app = express()
const PORT = process.env.PORT || 5001

app.use(cors({
    origin: 'https://chat-app-1-evdl.onrender.com',
    credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

server.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    ConnectDB()
})