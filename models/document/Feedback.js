import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  fileId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: ['Nội dung', 'Bị lặp tài liệu', 'Bản quyền', 'Khác'],
    default: 'Khác',
  },
  status: {
    type: String,
    enum: ['Chờ xử lý', 'Đã xem', 'Đã giải quyết'],
    default: 'Chờ xử lý',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

feedbackSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

feedbackSchema.index({ fileId: 1 })
feedbackSchema.index({ userId: 1 })
feedbackSchema.index({ createdAt: -1 })

export default mongoose.model('Feedback', feedbackSchema)
