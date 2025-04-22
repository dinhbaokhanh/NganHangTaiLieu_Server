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

const SavedDocument = mongoose.model('SavedDocument', savedDocumentSchema)

export default SavedDocument
