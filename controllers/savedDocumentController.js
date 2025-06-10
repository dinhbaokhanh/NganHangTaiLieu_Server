import { ErrorHandler, TryCatch } from '../utils/error.js'
import SavedDocument from '../models/SavedDocument.js'

const saveDocument = TryCatch(async (req, res, next) => {
  const { userId, documentId } = req.body

  const exists = await SavedDocument.findOne({ userId, documentId })
  if (exists) return next(new ErrorHandler('Đã lưu tài liệu này', 400))

  const saved = await SavedDocument.create({ userId, documentId })

  res.status(201).json({
    success: true,
    message: 'Tài liệu đã được lưu',
    saved: true,
  })
})

const unsaveDocument = TryCatch(async (req, res, next) => {
  const { userId, documentId } = req.body

  const deleted = await SavedDocument.findOneAndDelete({ userId, documentId })
  if (!deleted) return next(new ErrorHandler('Không tìm thấy tài liệu đã lưu', 404))

  res.status(200).json({
    success: true,
    message: 'Tài liệu đã được bỏ lưu',
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
    isSaved: !!exists,
  })
})

export {
  saveDocument,
  unsaveDocument,
  getSavedDocumentsByUser,
  isDocumentSaved,
}
