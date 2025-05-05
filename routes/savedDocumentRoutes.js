import express from 'express'
import {
  saveDocument,
  unsaveDocument,
  getSavedDocumentsByUser,
  isDocumentSaved,
} from '../controllers/savedDocumentController.js'
import { isAuthenticated } from '../middleware/Authenticate.js'

const router = express.Router()

router.post('/', isAuthenticated, saveDocument)
router.delete('/', isAuthenticated, unsaveDocument)
router.get('/:userId', isAuthenticated, getSavedDocumentsByUser)
router.get('/:userId/:documentId', isAuthenticated, isDocumentSaved)

export default router
