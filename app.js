import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import userRoutes from './routes/userRoutes.js'
import documentRoutes from './routes/documentRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'asdfghjklzxcvbnm'

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

app.use('/api/user', userRoutes)
app.use('/api/document', documentRoutes)

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Database is connected'))
  .catch((e) => console.log(e))

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`)
})

export { adminSecretKey }
