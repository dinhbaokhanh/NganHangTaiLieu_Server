import express from 'express'
import {
  addReview,
  deleteReview,
  getReviewsByDocument,
  updateReview,
} from '../controllers/reviewController'
import { isAuthenticated } from '../middleware/Authenticate'

const router = express.Router()

router.post('/', isAuthenticated, addReview)
router.get('/:documentId', isAuthenticated, getReviewsByDocument)
router.put('/', isAuthenticated, updateReview)
router.delete('/', isAuthenticated, deleteReview)

export default router
