import express from 'express'
import { chatReply } from '../controllers/chatbotController.js'
import { isAuthenticated } from '../middleware/Authenticate.js'

const router = express.Router()

router.post('/chat', isAuthenticated, chatReply)

export default router
