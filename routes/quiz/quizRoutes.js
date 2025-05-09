import express from 'express'
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../../controllers/quiz/quizController.js'
import { adminAuth } from '../../middleware/Authenticate.js'

const router = express.Router()

router.get('/', getAllQuizzes)
router.get('/:id', getQuizById)
router.post('/', adminAuth, createQuiz)
router.put('/:id', adminAuth, updateQuiz)
router.delete('/:id', adminAuth, deleteQuiz)

export default router
