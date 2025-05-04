import Review from '../../models/document/Review.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'
import User from '../../models/User.js'

const addReview = TryCatch(async (req, res, next) => {
  const { userId, documentId, comment } = req.body

  const existingReview = await Review.findOne({ userId, documentId })
  if (existingReview) {
    return next(
      new ErrorHandler('You have already reviewed this document', 400)
    )
  }

  const review = await Review.create({
    userId,
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

  const reviews = await Review.find({ documentId }).populate('userId', 'name')

  res.status(200).json({
    success: true,
    reviews,
  })
})

const updateReview = TryCatch(async (req, res, next) => {
  const { userId, documentId, comment } = req.body

  const review = await Review.findOne({ userId, documentId })
  if (!review) {
    return next(new ErrorHandler('Review not found', 404))
  }

  review.comment = comment || review.comment

  await review.save()

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review,
  })
})

const deleteReview = TryCatch(async (req, res, next) => {
  const { userId, documentId } = req.body

  const review = await Review.findOneAndDelete({ userId, documentId })
  if (!review) {
    return next(new ErrorHandler('Review not found', 404))
  }

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  })
})

const addReply = TryCatch(async (req, res, next) => {
  const { reviewId } = req.params
  const { userId, reply } = req.body

  const review = await Review.findById(reviewId)
  if (!review) {
    return next(new ErrorHandler('Review not found', 404))
  }

  const replyToUser = reply.match(/@(\w+)/) // Sử dụng RegEx để tìm @username

  let repliedToUserId = null
  if (replyToUser) {
    const username = replyToUser[1] // username được tìm thấy
    const user = await User.findOne({ username }) // Tìm người dùng theo username
    if (user) {
      repliedToUserId = user._id
    }
  }

  review.replies.push({
    userId,
    reply,
    repliedToUserId,
  })
  await review.save()

  res.status(200).json({
    success: true,
    message: 'Reply added successfully',
    review,
  })
})

const deleteReply = TryCatch(async (req, res, next) => {
  const { reviewId, replyId } = req.params
  const review = await Review.findById(reviewId)
  if (!review) return next(new ErrorHandler('Review not found', 404))

  review.replies = review.replies.filter((r) => r._id.toString() !== replyId)
  await review.save()

  res.status(200).json({
    success: true,
    message: 'Reply deleted successfully',
  })
})

export {
  addReview,
  getReviewsByDocument,
  updateReview,
  deleteReview,
  addReply,
  deleteReply,
}
