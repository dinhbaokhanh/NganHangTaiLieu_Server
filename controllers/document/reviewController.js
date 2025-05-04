import Review from '../models/Review.js'
import ErrorHandler from '../utils/ErrorHandler.js'
import TryCatch from '../middlewares/TryCatch.js'

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

export { addReview, getReviewsByDocument, updateReview, deleteReview }
