import { ErrorHandler, TryCatch } from '../utils/error.js'
import SavedDocument from '../models/savedDocument.js'

const saveDocument = TryCatch(async (req, res, next) => {
  const { userId, documentId } = req.body

  const exists = await SavedDocument.findOne({ userId, documentId })
  if (exists) return next(new ErrorHandler('Already saved', 400))

  const saved = await SavedDocument.create({ userId, documentId })

  res.status(201).json({
    success: true,
    message: 'Document saved successfully',
    saved,
  })
})

const unsaveDocument = TryCatch(async (req, res, next) => {
  const { userId, documentId } = req.body

  const deleted = await SavedDocument.findOneAndDelete({ userId, documentId })
  if (!deleted) return next(new ErrorHandler('Saved document not found', 404))

  res.status(200).json({
    success: true,
    message: 'Document unsaved successfully',
  })
})

const getSavedDocumentsByUser = TryCatch(async (req, res, next) => {
  const { userId } = req.params

  const savedDocs = await SavedDocument.find({ userId }).populate('documentId')

  res.status(200).json({
    success: true,
    documents: savedDocs.map((item) => item.documentId),
  })
})

const isDocumentSaved = TryCatch(async (req, res, next) => {
  const { userId, documentId } = req.params

  const exists = await SavedDocument.findOne({ userId, documentId })

  res.status(200).json({
    success: true,
    saved: !!exists,
  })
})

export {
  saveDocument,
  unsaveDocument,
  getSavedDocumentsByUser,
  isDocumentSaved,
}
