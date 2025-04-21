import jwt from 'jsonwebtoken'

const refreshTokenCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'none',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
}

const createAccessToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

const createRefreshToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: '7d',
  })
}

const sendToken = (res, user, code, message) => {
  const accessToken = createAccessToken(user._id)
  const refreshToken = createRefreshToken(user._id)

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  res.status(code).json({
    success: true,
    message,
    accessToken,
    user,
  })
}

export { sendToken, createAccessToken, createRefreshToken }
