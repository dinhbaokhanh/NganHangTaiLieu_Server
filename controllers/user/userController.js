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

const addUser = TryCatch(async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const file = req.file;

  // Kiểm tra thông tin bắt buộc
  if (!file) return next(new ErrorHandler('Please Upload Avatar', 400));
  if (!username || !email || !password) {
    return next(new ErrorHandler('Missing required fields', 400));
  }

  // Kiểm tra xem username hoặc email đã tồn tại chưa
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return next(new ErrorHandler('Username or Email is already used', 400));
  }

  // Mã hóa mật khẩu
  const hashPassword = await bcrypt.hash(password, 10);

  // Upload avatar lên Cloudinary
  const result = await uploadFilesToCloudinary([file]);
  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  // Tạo user mới
  const newUser = new User({
    username,
    email,
    password: hashPassword,
    avatar,
    role: role || 'user', // Nếu không có role, mặc định là 'user'
  });

  await newUser.save();

  // Trả về phản hồi
  res.status(201).json({
    success: true,
    message: 'User added successfully',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
    },
  });
});

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

const updateUserStatus = TryCatch(async (req, res, next) => {
  const { id } = req.params; // Lấy ID người dùng từ URL
  const { status } = req.body; // Lấy trạng thái mới từ body request

  // Kiểm tra giá trị status hợp lệ
  if (!['Active', 'Banned'].includes(status)) {
    return next(new ErrorHandler('Invalid status value', 400));
  }

  // Tìm người dùng theo ID
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler('User not found', 404));

  // Cập nhật trạng thái người dùng
  user.status = status;

  // Lưu thông tin người dùng sau khi cập nhật
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      status: user.status,
    },
  });
});

export {
  registerUser,
  loginUser,
  logout,
  addUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserStatus, // Export hàm updateUserStatus
}
