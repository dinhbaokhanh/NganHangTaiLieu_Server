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

  if (!file) return next(new ErrorHandler('Hãy đăng ảnh Avatar'))
  if (!username || !email || !password) {
    return next(new ErrorHandler('Thiếu thông tin cần điền', 400))
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existingUser) {
    return next(new ErrorHandler('Username hoặc Email đã được dùng', 400))
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
  sendToken(res, newUser, 201, 'Tạo tài khoản thành công')
})

const loginUser = TryCatch(async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) {
    return next(new ErrorHandler('Vui lòng điền đủ Username và Password', 400))
  }

  const user = await User.findOne({ username }).select('+password')
  if (!user) {
    return next(new ErrorHandler('Invalid username or password', 401))
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return next(new ErrorHandler('Sai Username hoặc Password', 401))
  }

  sendToken(res, user, 200, `${user.username} đăng nhập thành công`)
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

const updateUserStatus = TryCatch(async (req, res, next) => {
  const { id } = req.params
  const { status } = req.body

  // Validate status input
  if (!status || !['Active', 'Banned'].includes(status)) {
    return next(
      new ErrorHandler(
        'Invalid status value. Must be "Active" or "Banned"',
        400
      )
    )
  }

  const user = await User.findById(id)

  if (!user) {
    return next(new ErrorHandler('User not found', 404))
  }

  user.status = status
  await user.save()

  res.status(200).json({
    success: true,
    message: `User status updated to ${status} successfully`,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    },
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
  updateUserStatus,
}
