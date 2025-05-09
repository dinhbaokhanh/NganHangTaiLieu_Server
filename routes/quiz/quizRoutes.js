import express from 'express'
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesBySubject,
  searchQuizzes,
} from '../../controllers/quiz/quizController.js'
import { adminAuth, isAuthenticated } from '../../middleware/Authenticate.js'

const router = express.Router()

router.get('/', getAllQuizzes)
router.get('/search', searchQuizzes)
router.get('/by-subject', isAuthenticated, getQuizzesBySubject)
router.get('/:id', isAuthenticated, getQuizById)
router.post('/', adminAuth, createQuiz)
router.put('/:id', adminAuth, updateQuiz)
router.delete('/:id', adminAuth, deleteQuiz)

export default router
