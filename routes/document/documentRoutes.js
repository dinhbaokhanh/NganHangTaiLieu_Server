import express from 'express'
import multer from 'multer'
import {
  deleteDocument,
  getAllDocuments,
  replaceDocument,
  updateDocument,
  uploadDocument,
} from '../../controllers/document/documentController.js'
import { adminAuth, isAuthenticated } from '../../middleware/Authenticate.js'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post(
  '/upload',
  isAuthenticated,
  adminAuth,
  upload.single('file'),
  uploadDocument
)

router.get('/', getAllDocuments)
router.put('/:id', isAuthenticated, adminAuth, updateDocument)

router.put(
  '/replace/:id',
  isAuthenticated,
  adminAuth,
  upload.single('file'),
  replaceDocument
)

router.delete('/:id', isAuthenticated, adminAuth, deleteDocument)

export default router
