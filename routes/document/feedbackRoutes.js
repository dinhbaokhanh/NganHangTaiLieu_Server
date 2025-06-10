import express from 'express'
import {
  addFeedback,
  getFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
} from '../../controllers/document/feedbackController.js'
import { isAuthenticated, adminAuth } from '../../middleware/Authenticate.js'

const router = express.Router()

router.post('/', isAuthenticated, addFeedback)
router.get('/', isAuthenticated, getFeedbacks)
router.put('/:id/status', isAuthenticated, adminAuth, updateFeedbackStatus)
router.delete('/:id', isAuthenticated, adminAuth, deleteFeedback)

export default router
