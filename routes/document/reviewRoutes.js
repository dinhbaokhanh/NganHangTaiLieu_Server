import express from 'express'
import {
  addReply,
  addReview,
  deleteReply,
  deleteReview,
  getReviewsByDocument,
  updateReview,
} from '../../controllers/document/reviewController.js'
import { isAuthenticated } from '../../middleware/Authenticate.js'

const router = express.Router()

router.post('/', isAuthenticated, addReview)
router.get('/:documentId', isAuthenticated, getReviewsByDocument)
router.put('/', isAuthenticated, updateReview)
router.delete('/', isAuthenticated, deleteReview)

router.post('/:reviewId/reply', addReply)
router.delete('/:reviewId/reply/:replyId', deleteReply)

export default router
