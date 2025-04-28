import express from 'express'
import {
  registerUser,
  loginUser,
  logout,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserStatus,
} from '../controllers/user/userController.js'
import {
  forgotPassword,
  refreshToken,
  resetPassword,
  verifyResetToken,
} from '../controllers/user/authController.js'
import { adminAuth, isAuthenticated } from '../middleware/Authenticate.js'
import {
  loginValidator,
  registerValidator,
  validateHandler,
} from '../utils/validator.js'
import { singleAvatar } from '../middleware/multer.js'

const router = express.Router()

router.post('/forgot-password', forgotPassword)
router.get('/reset-password/:id/:token', verifyResetToken)
router.post('/reset-password/:id/:token', resetPassword)

router.post(
  '/register',
  singleAvatar,
  registerValidator(),
  validateHandler,
  registerUser
)
router.post('/login', loginValidator(), validateHandler, loginUser)

router.get('/logout', isAuthenticated, logout)
router.post('/refresh', refreshToken)

router.get('/', isAuthenticated, adminAuth, getAllUsers)
router.get('/:id', isAuthenticated, adminAuth, getUserById)
router.patch('/users/:id/status', updateUserStatus)

router.delete('/:id', isAuthenticated, adminAuth, deleteUserById)

export default router
