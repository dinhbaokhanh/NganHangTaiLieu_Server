import express from 'express'
import { createDocumentSummary } from '../../controllers/document/summaryController.js'
import { isAuthenticated } from '../../middleware/Authenticate.js'

const router = express.Router()

router.post('/document/:documentId', isAuthenticated, createDocumentSummary)

export default router