import Subject from '../../../models/Subject.js'
import { TryCatch, ErrorHandler } from '../../../utils/error.js'

// Create new subject
export const createSubject = TryCatch(async (req, res, next) => {
  const { name, code, major } = req.body

  const subject = await Subject.create({ name, code, major })

  res.status(201).json({
    success: true,
    subject,
  })
})

// Get all subjects
export const getAllSubjects = TryCatch(async (req, res, next) => {
  const subjects = await Subject.find()

  res.status(200).json({
    success: true,
    subjects,
  })
})

// Get single subject by ID
export const getSubjectById = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const subject = await Subject.findById(id)

  if (!subject) return next(new ErrorHandler('Không tìm thấy môn học', 404))

  res.status(200).json({
    success: true,
    subject,
  })
})

// Update subject by ID
export const updateSubjectById = TryCatch(async (req, res, next) => {
  const { id } = req.params

  let subject = await Subject.findById(id)

  if (!subject) return next(new ErrorHandler('Không tìm thấy môn học', 404))

  subject = await Subject.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    subject,
  })
})

// Delete subject by ID
export const deleteSubjectById = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const subject = await Subject.findById(id)

  if (!subject) return next(new ErrorHandler('Không tìm thấy môn học', 404))

  await subject.deleteOne()

  res.status(200).json({
    success: true,
    message: `Môn học ${subject.name} đã được xóa.`,
  })
})
