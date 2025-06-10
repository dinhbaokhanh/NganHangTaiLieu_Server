import { TryCatch, ErrorHandler } from '../../utils/error.js'
import jwt from 'jsonwebtoken'
import User from '../../models/User.js'
import { sendToken } from '../../utils/features.js'
import bcrypt from 'bcryptjs'
import { uploadFilesToCloudinary } from '../../helper/cloudinary.js'

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
    return next(new ErrorHandler('Tên đăng nhập hoặc mật khẩu không hợp lệ', 401))
  }

  if (user.status === 'Banned') {
    return next(new ErrorHandler('Tài khoản của bạn đã bị khóa', 403))
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return next(new ErrorHandler('Sai tên đăng nhập hoặc mật khẩu', 401))
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
    message: 'Đăng xuất thành công!',
  })
})

const addUser = TryCatch(async (req, res, next) => {
  const { username, email, password, role } = req.body
  const file = req.file

  // Kiểm tra thông tin bắt buộc
  if (!file) return next(new ErrorHandler('Vui lòng tải lên Avatar', 400))
  if (!username || !email || !password) {
    return next(new ErrorHandler('Thiếu thông tin cần thiết', 400))
  }

  // Kiểm tra xem username hoặc email đã tồn tại chưa
  const existingUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existingUser) {
    return next(new ErrorHandler('Tên đăng nhập hoặc Email đã được sử dụng', 400))
  }

  // Mã hóa mật khẩu
  const hashPassword = await bcrypt.hash(password, 10)

  // Upload avatar lên Cloudinary
  const result = await uploadFilesToCloudinary([file])
  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  }

  // Tạo user mới
  const newUser = new User({
    username,
    email,
    password: hashPassword,
    avatar,
    role: role || 'user',
  })

  await newUser.save()

  // Trả về phản hồi
  res.status(201).json({
    success: true,
    message: 'Tạo người dùng thành công',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
    },
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

  if (!user) return next(new ErrorHandler('Không tìm thấy người dùng', 404))

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
        'Status không hợp lệ. Phải là "Active" hoặc "Banned"',
        400
      )
    )
  }

  const user = await User.findById(id)

  if (!user) {
    return next(new ErrorHandler('Không tìm thấy người dùng', 404))
  }

  user.status = status
  await user.save()

  res.status(200).json({
    success: true,
    message: `Cập nhật status người dùng thành công: ${status}`,
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

  if (!user) return next(new ErrorHandler('Không tìm thấy người dùng', 404))

  await user.deleteOne()

  res.status(200).json({
    success: true,
    message: `Người dùng ${user.username} đã được xóa.`,
  })
})

const changePassword = TryCatch(async (req, res, next) => {
  const userId = req.user._id
  const { oldPassword, newPassword, confirmPassword } = req.body

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler('Vui lòng nhập đầy đủ thông tin', 400))
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler('Mật khẩu mới và xác nhận không khớp', 400))
  }

  const user = await User.findById(userId).select('+password')
  if (!user) {
    return next(new ErrorHandler('Không tìm thấy người dùng', 404))
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch) {
    return next(new ErrorHandler('Mật khẩu cũ không đúng', 400))
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
  })
})

export {
  registerUser,
  loginUser,
  logout,
  addUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserStatus,
  changePassword,
}
