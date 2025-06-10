import Feedback from '../../models/document/Feedback.js'
import User from '../../models/User.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'

export const addFeedback = TryCatch(async (req, res, next) => {
  const { fileId, comment, fileName, category } = req.body
  const userId = req.user._id

  if (!fileId || !comment || !fileName) {
    return next(new ErrorHandler('Thiếu thông tin bắt buộc', 400))
  }

  const existing = await Feedback.findOne({ userId, fileId })
  const user = await User.findById(userId)

  const username = user?.username
  const email = user?.email

  if (existing) {
    return next(
      new ErrorHandler('Bạn đã gửi phản hồi cho tài liệu này rồi', 400)
    )
  }

  const feedback = await Feedback.create({
    fileId,
    fileName,
    userId,
    username,
    email,
    comment,
    category,
  })

  res.status(201).json({
    success: true,
    message: 'Gửi phản hồi thành công',
    feedback,
  })
})

export const getFeedbacks = TryCatch(async (req, res) => {
  const { fileId, userId, status } = req.query
  const filter = {}
  if (fileId) filter.fileId = fileId
  if (userId) filter.userId = userId
  if (status) filter.status = status

  const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 })
  res.status(200).json({ success: true, feedbacks })
})

export const updateFeedbackStatus = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const { status } = req.body

  if (!['Chờ xử lý', 'Đã xem', 'Đã giải quyết'].includes(status)) {
    return next(new ErrorHandler('Trạng thái không hợp lệ', 400))
  }

  const feedback = await Feedback.findByIdAndUpdate(
    id,
    { status, updatedAt: Date.now() },
    { new: true }
  )

  if (!feedback) {
    return next(new ErrorHandler('Không tìm thấy phản hồi', 404))
  }

  res
    .status(200)
    .json({ success: true, message: 'Cập nhật thành công', feedback })
})

export const deleteFeedback = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const feedback = await Feedback.findByIdAndDelete(id)
  if (!feedback) {
    return next(new ErrorHandler('Không tìm thấy phản hồi', 404))
  }

  res.status(200).json({ success: true, message: 'Xoá phản hồi thành công' })
})
