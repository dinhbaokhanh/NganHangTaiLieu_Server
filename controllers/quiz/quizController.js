import Quiz from '../../models/quiz/Quiz.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'

// GET all quizzes (populate subject)
export const getAllQuizzes = TryCatch(async (req, res) => {
  const quizzes = await Quiz.find(
    {},
    'title description questions subject'
  ).populate('subject', 'name code major')
  res.status(200).json({ success: true, quizzes })
})

// GET one quiz (populate subject)
export const getQuizById = TryCatch(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id).populate(
    'subject',
    'name code major'
  )
  if (!quiz) return next(new ErrorHandler('Quiz not found', 404))

  res.status(200).json({ success: true, quiz })
})

export const getQuizzesBySubject = TryCatch(async (req, res, next) => {
  const subjectName = req.query.subject

  if (!subjectName) {
    return res.status(400).json({ message: 'Thiếu tên môn học (subject)' })
  }

  const quizzes = await Quiz.find().populate({
    path: 'subject',
    match: { name: subjectName },
  })

  const filteredQuizzes = quizzes.filter((q) => q.subject !== null)

  res.status(200).json({ quizzes: filteredQuizzes })
})

// POST create new quiz
export const createQuiz = TryCatch(async (req, res) => {
  const { title, description, questions, subject } = req.body
  const quiz = await Quiz.create({ title, description, questions, subject })
  res.status(201).json({ success: true, message: 'Quiz created', quiz })
})

// PUT update quiz (update subject if provided)
export const updateQuiz = TryCatch(async (req, res, next) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate('subject', 'name code major')
  if (!quiz) return next(new ErrorHandler('Quiz not found', 404))

  res.status(200).json({ success: true, message: 'Quiz updated', quiz })
})

// DELETE quiz
export const deleteQuiz = TryCatch(async (req, res, next) => {
  const deleted = await Quiz.findByIdAndDelete(req.params.id)
  if (!deleted) return next(new ErrorHandler('Quiz not found', 404))

  res.status(200).json({ success: true, message: 'Quiz deleted' })
})

export const searchQuizzes = TryCatch(async (req, res) => {
  const keyword = req.query.keyword?.trim()

  if (!keyword) {
    return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm (keyword)' })
  }

  const quizzes = await Quiz.find({
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ],
  }).populate('subject', 'name code major')

  const subjectMatched = await Quiz.find().populate({
    path: 'subject',
    match: { name: { $regex: keyword, $options: 'i' } },
    select: 'name code major',
  })

  const subjectFiltered = subjectMatched.filter((q) => q.subject !== null)

  const quizMap = new Map()
  quizzes
    .concat(subjectFiltered)
    .forEach((q) => quizMap.set(q._id.toString(), q))
  const mergedQuizzes = Array.from(quizMap.values())

  res.status(200).json({ success: true, quizzes: mergedQuizzes })
})
