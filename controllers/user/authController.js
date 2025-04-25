import { TryCatch, ErrorHandler } from '../../utils/error.js'
import jwt from 'jsonwebtoken'
import { createAccessToken } from '../../utils/features.js'
import User from '../../models/User.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const refreshToken = TryCatch((req, res, next) => {
  const token = req.cookies.refreshToken
  if (!token) return next(new ErrorHandler('Please login again', 401))

  const decoded = jwt.verify(token, process.env.REFRESH_SECRET)

  const accessToken = createAccessToken(decoded._id)

  res.status(200).json({
    success: true,
    accessToken,
  })
})

const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return next(new ErrorHandler('User with this email does not exist', 404))
  }

  const secret = process.env.JWT_SECRET + user.password

  const token = jwt.sign({ _id: user._id, email: user.email }, secret, {
    expiresIn: process.env.TOKEN_EXPIRE,
  })

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in ${process.env.TOKEN_EXPIRE}.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  }

  await transporter.sendMail(mailOptions)

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    console.log('Reset link:', resetLink)
  }

  res.status(200).json({
    success: true,
  })
})

const verifyResetToken = TryCatch(async (req, res, next) => {
  const { id, token } = req.params

  const user = await User.findById(id)
  if (!user) {
    return next(new ErrorHandler('Invalid reset link', 400))
  }

  const secret = process.env.JWT_SECRET + user.password

  try {
    const decoded = jwt.verify(token, secret)

    res.status(200).json({
      success: true,
      email: decoded.email,
    })
  } catch (error) {
    return next(new ErrorHandler('Invalid or expired reset link', 400))
  }
})

const resetPassword = TryCatch(async (req, res, next) => {
  const { id, token } = req.params
  const { password, confirmPassword } = req.body

  if (!password || password.length < 8) {
    return next(new ErrorHandler('Password must be at least 8 characters', 400))
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler('Passwords do not match', 400))
  }

  const user = await User.findById(id)
  if (!user) {
    return next(new ErrorHandler('Invalid reset link', 400))
  }

  const secret = process.env.JWT_SECRET + user.password

  try {
    jwt.verify(token, secret)

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.findByIdAndUpdate(id, { password: hashedPassword })

    res.status(200).json({
      success: true,
    })
  } catch (error) {
    return next(new ErrorHandler('Invalid or expired reset link', 400))
  }
})

export { refreshToken, forgotPassword, verifyResetToken, resetPassword }
