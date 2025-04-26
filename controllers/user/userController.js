import { TryCatch, ErrorHandler } from '../../utils/error.js'
import jwt from 'jsonwebtoken'
import User from '../../models/User.js'
import { sendToken } from '../../utils/features.js'
import bcrypt from 'bcryptjs'
import { uploadFilesToCloudinary } from '../../helper/cloudinary.js'
const { compare } = bcrypt

const registerUser = TryCatch(async (req, res, next) => {
  const { username, email, password } = req.body
  const file = req.file

  if (!file) return next(new ErrorHandler('Please Upload Avatar'))
  if (!username || !email || !password) {
    return next(new ErrorHandler('Missing required fields', 400))
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existingUser) {
    return next(new ErrorHandler('Username or Email is already used', 400))
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const result = await uploadFilesToCloudinary([file])

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  }

  const newUser = new User({
    username,
    email,
    password: hashPassword,
    avatar,
    role: 'user',
  })

  await newUser.save()
  sendToken(res, newUser, 201, 'User created')
})

const loginUser = TryCatch(async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) {
    return next(new ErrorHandler('Username and password are required', 400))
  }

  const user = await User.findOne({ username }).select('+password')
  if (!user) {
    return next(new ErrorHandler('Invalid username or password', 401))
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return next(new ErrorHandler('Invalid username or password', 401))
  }

  sendToken(res, user, 200, `${user.username} logged in successfully`)
})

const logout = TryCatch((req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
  })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully!',
  })
})

const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find().select('-password')

  res.status(200).json({
    success: true,
    users,
  })
})

const getUserById = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findById(id).select('-password')

  if (!user) return next(new ErrorHandler('User not found', 404))

  res.status(200).json({
    success: true,
    user,
  })
})

const deleteUserById = TryCatch(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findById(id)

  if (!user) return next(new ErrorHandler('User not found', 404))

  await user.deleteOne()

  res.status(200).json({
    success: true,
    message: `User ${user.username} has been deleted.`,
  })
})

export {
  registerUser,
  loginUser,
  logout,
  getAllUsers,
  getUserById,
  deleteUserById,
}
