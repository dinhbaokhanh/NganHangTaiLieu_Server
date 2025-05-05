import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
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
  comment: {
    type: String,
    required: true,
  },
  replies: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      reply: {
        type: String,
        required: true,
      },
      repliedToUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Review = mongoose.model('Review', reviewSchema)
export default Review
