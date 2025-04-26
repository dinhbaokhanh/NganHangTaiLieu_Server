import { TryCatch, ErrorHandler } from '../utils/error.js'
import jwt from 'jsonwebtoken'

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey)
}

const isAuthenticated = TryCatch((req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return next(new ErrorHandler('Please login', 401))

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token, process.env.JWT_SECRET)

  req.user = payload
  next()
})

const adminAuth = TryCatch(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return next(new ErrorHandler('Please login as ADMIN', 401))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') {
      return next(new ErrorHandler('Access denied', 403))
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error('Token verification failed:', error)
    return next(new ErrorHandler('Invalid or expired token', 401))
  }
})

export { isAuthenticated, adminAuth }
