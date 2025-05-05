import mongoose from 'mongoose'

const savedDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
})

// Ngăn trùng lặp (1 user không lưu 1 document nhiều lần)
savedDocumentSchema.index({ userId: 1, documentId: 1 }, { unique: true })

const SavedDocument = mongoose.model('SavedDocument', savedDocumentSchema)

export default SavedDocument
