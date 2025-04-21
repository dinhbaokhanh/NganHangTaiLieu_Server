import express from 'express'
import {
  registerUser,
  loginUser,
  logout,
} from '../controllers/user/userController.js'
import {
  forgotPassword,
  refreshToken,
  resetPassword,
  verifyResetToken,
} from '../controllers/user/authController.js'
import { isAuthenticated } from '../middleware/Authenticate.js'
import {
  loginValidator,
  registerValidator,
  validateHandler,
} from '../utils/validator.js'

const router = express.Router()

router.post('/forgot-password', forgotPassword)
router.get('/reset-password/:id/:token', verifyResetToken)
router.post('/reset-password/:id/:token', resetPassword)

router.post('/register', registerValidator(), validateHandler, registerUser)
router.post('/login', loginValidator(), validateHandler, loginUser)

router.get('/logout', isAuthenticated, logout)
router.post('/refresh', isAuthenticated, refreshToken)

export default router
