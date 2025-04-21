import express from 'express'
import multer from 'multer'
import {
  deleteDocument,
  getAllDocuments,
  replaceDocument,
  updateDocument,
  uploadDocument,
} from '../controllers/documentController.js'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/upload', upload.single('file'), uploadDocument)
router.get('/', getAllDocuments)
router.put('/update/:id', updateDocument)
router.put('/replace/:id', upload.single('file'), replaceDocument)
router.delete('/delete/:id', deleteDocument)

export default router
