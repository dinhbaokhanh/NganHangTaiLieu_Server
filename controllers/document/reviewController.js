import Review from '../../models/document/Review.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'
import User from '../../models/User.js'

// Thêm reply vào cây nested
const addNestedReply = (replies, parentId, newReply) => {
  for (const r of replies) {
    if (r._id.toString() === parentId) {
      r.replies.push(newReply)
      return true
    }
    if (r.replies.length) {
      if (addNestedReply(r.replies, parentId, newReply)) return true
    }
  }
  return false
}

// Xóa reply trong cây nested
const deleteNestedReply = (replies, replyId) => {
  let removed = false
  replies.forEach((r, idx) => {
    if (r._id.toString() === replyId) {
      replies.splice(idx, 1)
      removed = true
    } else if (r.replies.length) {
      if (deleteNestedReply(r.replies, replyId)) removed = true
    }
  })
  return removed
}

const addReview = TryCatch(async (req, res, next) => {
  const { userId, documentId, comment } = req.body // Client chỉ cần gửi documentId và comment
  const existing = await Review.findOne({ userId, documentId })
  if (existing) {
    return next(
      new ErrorHandler('You have already reviewed this document', 400)
    )
  }

  // Tạo review mới
  const review = await Review.create({
    userId, // đảm bảo có
    documentId,
    comment,
  })

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    review,
  })
})

const getReviewsByDocument = TryCatch(async (req, res, next) => {
  const { documentId } = req.params
  const reviews = await Review.find({ documentId })
    .populate('userId', 'username avatar')
    .populate('replies.userId', 'username avatar')
    .populate('replies.replies.userId', 'username avatar')
  res.status(200).json({ success: true, reviews })
})

const updateReview = TryCatch(async (req, res, next) => {
  const { userId, documentId, comment } = req.body

  const review = await Review.findOne({ userId, documentId })
  if (!review) return next(new ErrorHandler('Review not found', 404))

  review.comment = comment || review.comment
  await review.save()

  res
    .status(200)
    .json({ success: true, message: 'Review updated successfully', review })
})

const deleteReview = TryCatch(async (req, res, next) => {
  const { reviewId, userId } = req.body

  const deleted = await Review.findOneAndDelete({ _id: reviewId, userId })
  if (!deleted)
    return next(new ErrorHandler('Review not found or no permission', 404))

  res
    .status(200)
    .json({ success: true, message: 'Review deleted successfully' })
})

const addReply = TryCatch(async (req, res, next) => {
  const { reviewId } = req.params
  const { reply, parentReplyId, userId } = req.body

  const review = await Review.findById(reviewId)
  if (!review) return next(new ErrorHandler('Review not found', 404))

  // Xác định repliedToUserId nếu có @username mention
  const mention = reply.match(/@([\w]+)/)
  let repliedToUserId = null
  if (mention) {
    const user = await User.findOne({ username: mention[1] })
    if (user) repliedToUserId = user._id
  }

  const newReply = { userId, reply, repliedToUserId, replies: [] }

  if (!parentReplyId) {
    review.replies.push(newReply)
  } else {
    const success = addNestedReply(review.replies, parentReplyId, newReply)
    if (!success) return next(new ErrorHandler('Parent reply not found', 404))
  }

  await review.save()
  res
    .status(201)
    .json({ success: true, message: 'Reply added successfully', review })
})

const deleteReply = TryCatch(async (req, res, next) => {
  const { reviewId, replyId } = req.params
  const { userId } = req.body

  const review = await Review.findById(reviewId)
  if (!review) return next(new ErrorHandler('Review not found', 404))

  // Thử xóa ở root level
  let removed = false
  review.replies = review.replies.filter((r) => {
    if (r._id.toString() === replyId && r.userId.toString() === userId) {
      removed = true
      return false
    }
    return true
  })
  // Nếu chưa xóa, tìm trong nested
  if (!removed) removed = deleteNestedReply(review.replies, replyId)
  if (!removed)
    return next(new ErrorHandler('Reply not found or no permission', 404))

  await review.save()
  res
    .status(200)
    .json({ success: true, message: 'Reply deleted successfully', review })
})

export {
  addReview,
  getReviewsByDocument,
  updateReview,
  deleteReview,
  addReply,
  deleteReply,
}
