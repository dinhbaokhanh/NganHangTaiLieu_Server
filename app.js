import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'

import userRoutes from './routes/userRoutes.js'
import documentRoutes from './routes/document/documentRoutes.js'
import savedDocumentRoutes from './routes/savedDocumentRoutes.js'
import reviewRoutes from './routes/document/reviewRoutes.js'
import subjectRoutes from './routes/subjectRoutes.js'
import quizRoutes from './routes/quiz/quizRoutes.js'
import { errorMiddleware } from './middleware/error.js'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const adminSecretKey = process.env.ADMIN_SECRET_KEY

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

app.use('/api/user', userRoutes)
app.use('/api/document', documentRoutes)
app.use('/api/saved-documents', savedDocumentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/subject', subjectRoutes)
app.use('/api/quiz', quizRoutes)

app.use(errorMiddleware)

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Database is connected'))
  .catch((e) => console.log(e))

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`)
})

export { adminSecretKey }
