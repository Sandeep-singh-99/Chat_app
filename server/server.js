import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'

import ConnectDB from './config/db.js'
import authRoutes from './router/auth.routes.js'


const app = express()
const PORT = process.env.PORT || 5001

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    ConnectDB()
})