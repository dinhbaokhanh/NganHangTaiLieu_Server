import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    saved: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    major: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
)

const Document = mongoose.model('Document', documentSchema)

export default Document
