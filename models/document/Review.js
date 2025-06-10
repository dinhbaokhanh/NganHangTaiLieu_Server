import mongoose from 'mongoose'

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reply: { type: String, required: true },
  parentReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null,
  },
  repliedToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
})

replySchema.add({ replies: [replySchema] })

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true,
  },
  comment: { type: String, required: true },
  replies: { type: [replySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Review', reviewSchema)
