import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    saved: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      required: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
  },
  { timestamps: true }
)

const Document = mongoose.model('Document', documentSchema)

export default Document
