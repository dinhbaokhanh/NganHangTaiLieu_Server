import { TryCatch, ErrorHandler } from '../utils/error.js'

import jwt from 'jsonwebtoken'
import { adminSecretKey } from '../app.js'

const isAuthenticated = TryCatch((req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return next(new ErrorHandler('Please login', 401))

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  req.user = decoded._id
  next()
})

const adminAuth = TryCatch((req, res, next) => {
  const token = req.cookies['admin-token']

  if (!token) {
    return next(new ErrorHandler('Please login as ADMIN', 401))
  }

  const secretKey = jwt.verify(token, process.env.JWT_SECRET)
  const isMatch = secretKey === adminSecretKey

  if (!isMatch) return next(new ErrorHandler('Invalid Admin Key', 401))

  next()
})

export { isAuthenticated, adminAuth }
