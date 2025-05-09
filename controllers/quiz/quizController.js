import Quiz from '../../models/quiz/Quiz.js'
import { ErrorHandler, TryCatch } from '../../utils/error.js'

// GET all quizzes
export const getAllQuizzes = TryCatch(async (req, res) => {
  const quizzes = await Quiz.find({}, 'title description questions')
  res.status(200).json({ success: true, quizzes })
})

// GET one quiz
export const getQuizById = TryCatch(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id)
  if (!quiz) return next(new ErrorHandler('Quiz not found', 404))

  res.status(200).json({ success: true, quiz })
})

// POST create new quiz
export const createQuiz = TryCatch(async (req, res) => {
  const { title, description, questions } = req.body
  console.log(title, description, questions)
  const quiz = await Quiz.create({ title, description, questions })
  res.status(201).json({ success: true, message: 'Quiz created', quiz })
})

// PUT update quiz
export const updateQuiz = TryCatch(async (req, res, next) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
  if (!quiz) return next(new ErrorHandler('Quiz not found', 404))

  res.status(200).json({ success: true, message: 'Quiz updated', quiz })
})

// DELETE quiz
export const deleteQuiz = TryCatch(async (req, res, next) => {
  const deleted = await Quiz.findByIdAndDelete(req.params.id)
  if (!deleted) return next(new ErrorHandler('Quiz not found', 404))

  res.status(200).json({ success: true, message: 'Quiz deleted' })
})
